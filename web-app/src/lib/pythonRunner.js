/**
 * Python execution runner.
 * In the macOS desktop app, this talks directly to Electron IPC to execute against
 * the user's native Python (Anaconda / Homebrew / System Python) with full support
 * for NumPy, Scikit-Learn, Matplotlib, Pandas, and PyTorch.
 */

let cachedEnvInfo = null;

export function isNativePythonAvailable() {
  return typeof window !== 'undefined' && Boolean(window.electronAPI?.executePython);
}

export async function getPythonEnvironment() {
  if (cachedEnvInfo) return cachedEnvInfo;

  if (isNativePythonAvailable()) {
    try {
      const info = await window.electronAPI.getPythonEnv();
      cachedEnvInfo = info;
      return info;
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return {
    ok: false,
    error: 'Native Python runner requires the macOS desktop app.',
    packages: {},
  };
}

export async function runPythonCode(code) {
  if (!code || !code.trim()) {
    return {
      ok: false,
      error: 'Code is empty.',
      stdout: '',
      stderr: '',
      figures: [],
      timeMs: 0,
    };
  }

  if (isNativePythonAvailable()) {
    try {
      const result = await window.electronAPI.executePython(code);
      return result;
    } catch (err) {
      return {
        ok: false,
        error: `Execution failed: ${err.message}`,
        stdout: '',
        stderr: err.message,
        figures: [],
        timeMs: 0,
      };
    }
  }

  // Fallback when accessed from standard browser outside macOS Electron app
  return {
    ok: false,
    error: 'Interactive Python code execution is active in the macOS desktop app. Open "AI Visualised Engineering.app" to run with Anaconda / NumPy / Matplotlib.',
    stdout: '',
    stderr: '',
    figures: [],
    timeMs: 0,
  };
}
