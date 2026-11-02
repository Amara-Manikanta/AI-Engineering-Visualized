import routeFileMap from './routeFileMap.json';

// Vite lazy glob to import raw source text of all pages without overhead
const rawPageLoaders = import.meta.glob('../pages/**/*.jsx', {
  query: '?raw',
  import: 'default',
});

const STORAGE_PREFIX = 'topic_custom_code_';

/**
 * Retrieve the original bundled JSX source code for a route pathname
 */
export async function getOriginalPageSource(pathname) {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const relPath = routeFileMap[clean];
  if (!relPath) return null;

  const loader = rawPageLoaders[relPath];
  if (!loader) return null;

  try {
    const rawCode = await loader();
    return rawCode;
  } catch (err) {
    console.error(`Failed to load raw source for ${pathname} (${relPath}):`, err);
    return null;
  }
}

/**
 * Retrieve user-edited code from localStorage if available
 */
export function getCustomPageCode(pathname) {
  try {
    const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    return localStorage.getItem(STORAGE_PREFIX + clean) || null;
  } catch {
    return null;
  }
}

/**
 * Save user-edited code to localStorage
 */
export function saveCustomPageCode(pathname, code) {
  try {
    const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_PREFIX + clean, code);
    window.dispatchEvent(new CustomEvent('topic_custom_code_change', { detail: { pathname: clean } }));
  } catch (err) {
    console.error('Failed to save custom page code to localStorage:', err);
  }
}

/**
 * Delete user-edited code and revert to bundled original
 */
export function clearCustomPageCode(pathname) {
  try {
    const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    localStorage.removeItem(STORAGE_PREFIX + clean);
    window.dispatchEvent(new CustomEvent('topic_custom_code_change', { detail: { pathname: clean } }));
  } catch (err) {
    console.error('Failed to clear custom page code:', err);
  }
}

/**
 * Check if the current topic has custom user edits
 */
export function hasCustomPageCode(pathname) {
  return Boolean(getCustomPageCode(pathname));
}

/**
 * Retrieve path, filename, and directory for a route pathname
 */
export function getSourceFileInfo(pathname) {
  const clean = pathname === '/' ? '/' : (pathname || '').split('#')[0].replace(/\/+$/, '');
  let relPath = routeFileMap[clean];

  if (!relPath) {
    if (clean === '/ml/code-lab' || clean === '/practice') {
      relPath = '../pages/MlCodeLab.jsx';
    } else if (clean === '' || clean === '/') {
      relPath = '../pages/Home.jsx';
    } else {
      relPath = `../pages${clean}.jsx`;
    }
  }

  const fullRepoPath = 'web-app/src/' + relPath.replace(/^\.\.\//, '');
  const fileName = fullRepoPath.split('/').pop() || '';
  const dirPath = fullRepoPath.substring(0, fullRepoPath.lastIndexOf('/') + 1);

  return {
    fullRepoPath,
    fileName,
    dirPath,
  };
}
