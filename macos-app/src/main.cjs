const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

let mainWindow;

// Python discovery on macOS
function findPythonExecutable() {
  const home = os.homedir();
  const candidates = [
    '/opt/anaconda3/bin/python3',
    path.join(home, 'anaconda3/bin/python3'),
    path.join(home, 'miniconda3/bin/python3'),
    path.join(home, 'opt/anaconda3/bin/python3'),
    path.join(home, 'opt/miniconda3/bin/python3'),
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python3',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return 'python3';
}

const PYTHON_HARNESS = `
import sys, io, json, base64, time, traceback

code = sys.stdin.read()
start_t = time.perf_counter()

stdout_buf = io.StringIO()
stderr_buf = io.StringIO()
old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = stdout_buf
sys.stderr = stderr_buf

figures = []
ok = True
err = None
tb = None

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except Exception:
    plt = None

exec_globals = {'__name__': '__main__'}

try:
    exec(code, exec_globals)
    if plt:
        for fignum in plt.get_fignums():
            fig = plt.figure(fignum)
            buf = io.BytesIO()
            fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
            buf.seek(0)
            figures.append('data:image/png;base64,' + base64.b64encode(buf.read()).decode('utf-8'))
        plt.close('all')
except Exception as e:
    ok = False
    err = str(e)
    tb = traceback.format_exc()
finally:
    sys.stdout = old_stdout
    sys.stderr = old_stderr

elapsed = int((time.perf_counter() - start_t) * 1000)

result = {
    'ok': ok,
    'stdout': stdout_buf.getvalue(),
    'stderr': stderr_buf.getvalue(),
    'error': err,
    'traceback': tb,
    'figures': figures,
    'timeMs': elapsed
}

print(json.dumps(result))
`;

// Setup IPC handlers for Python execution
function setupIpcHandlers() {
  ipcMain.handle('get-python-env', async () => {
    const pythonPath = findPythonExecutable();
    return new Promise((resolve) => {
      const probeCode = `
import sys, json
mods = ['numpy', 'sklearn', 'matplotlib', 'pandas', 'scipy', 'torch', 'transformers', 'mlx']
found = {}
for m in mods:
    try:
        mod = __import__(m)
        found[m] = getattr(mod, '__version__', 'available')
    except ImportError:
        found[m] = None

print(json.dumps({
    'version': sys.version.split(' ')[0],
    'executable': sys.executable,
    'packages': found
}))
`;
      const proc = spawn(pythonPath, ['-c', probeCode]);
      let stdout = '';
      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) {
          try {
            const data = JSON.parse(stdout);
            resolve({ ok: true, pythonPath, ...data });
            return;
          } catch (_) { /* fallback */ }
        }
        resolve({ ok: false, pythonPath, error: 'Failed to inspect python environment' });
      });
      proc.on('error', (err) => {
        resolve({ ok: false, pythonPath, error: err.message });
      });
    });
  });

  ipcMain.handle('execute-python', async (_event, { code, timeoutMs = 30000 }) => {
    const pythonPath = findPythonExecutable();
    return new Promise((resolve) => {
      const proc = spawn(pythonPath, ['-c', PYTHON_HARNESS]);
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGKILL');
        resolve({
          ok: false,
          error: `Execution timed out after ${timeoutMs / 1000} seconds.`,
          stdout: stdout,
          stderr: 'Timeout',
          figures: [],
          timeMs: timeoutMs,
        });
      }, timeoutMs);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (exitCode) => {
        clearTimeout(timer);
        if (timedOut) return;

        if (exitCode !== 0 && !stdout.trim()) {
          resolve({
            ok: false,
            error: stderr || `Process exited with code ${exitCode}`,
            traceback: stderr,
            stdout: '',
            stderr,
            figures: [],
            timeMs: 0,
          });
          return;
        }

        try {
          // stdout should contain the JSON string from harness
          const jsonStart = stdout.indexOf('{');
          const jsonEnd = stdout.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
            const res = JSON.parse(jsonStr);
            resolve(res);
            return;
          }
          resolve({
            ok: exitCode === 0,
            stdout,
            stderr,
            figures: [],
            timeMs: 0,
          });
        } catch (parseErr) {
          resolve({
            ok: false,
            error: `Failed to parse Python output: ${parseErr.message}`,
            stdout,
            stderr,
            figures: [],
            timeMs: 0,
          });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          ok: false,
          error: `Failed to spawn Python process at ${pythonPath}: ${err.message}`,
          stdout: '',
          stderr: err.message,
          figures: [],
          timeMs: 0,
        });
      });

      // Feed code to stdin
      proc.stdin.write(code);
      proc.stdin.end();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 880,
    minWidth: 960,
    minHeight: 650,
    title: 'AI Visualised Engineering',
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a0a0a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const fs = require('fs');
    const localDist = path.join(__dirname, '../dist/index.html');
    const webDist = path.join(__dirname, '../../web-app/dist/index.html');
    const targetPath = fs.existsSync(localDist) ? localDist : webDist;
    mainWindow.loadFile(targetPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Safe fallback to guarantee the window is shown
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 1200);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Handle external link clicks in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: 'AI Visualised Engineering',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: async () => {
            await shell.openExternal('https://github.com/Amara-Manikanta/ai-engineering-visualized');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
