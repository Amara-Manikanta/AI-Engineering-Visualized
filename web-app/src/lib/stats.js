/* ---------------------------------------------------------------------------
   Small statistics toolkit for the data, statistics and classical ML pages.

   Everything the visualisations show is computed here rather than typed in:
   seeded random draws (so a page looks the same on every load), summary
   statistics, the normal / t / chi-square distributions, correlation, and an
   ordinary-least-squares solver. No dependencies.
--------------------------------------------------------------------------- */

/* Seeded PRNG (mulberry32). Same seed, same sequence, every time. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Standard normal draw via Box–Muller, from any uniform source. */
export function randn(rand) {
  let u = 0;
  while (u === 0) u = rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs) => (xs.length ? sum(xs) / xs.length : NaN);

/* Sample variance (n − 1) by default; pass ddof = 0 for the population form. */
export function variance(xs, ddof = 1) {
  if (xs.length - ddof <= 0) return NaN;
  const m = mean(xs);
  return sum(xs.map((x) => (x - m) ** 2)) / (xs.length - ddof);
}
export const std = (xs, ddof = 1) => Math.sqrt(variance(xs, ddof));

/* Linear-interpolated quantile, matching numpy's default. */
export function quantile(xs, q) {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
export const median = (xs) => quantile(xs, 0.5);

/* Mode for discrete-ish data: the most frequent value (first on ties). */
export function mode(xs) {
  const counts = new Map();
  xs.forEach((x) => counts.set(x, (counts.get(x) || 0) + 1));
  let best = null;
  let n = 0;
  counts.forEach((c, x) => {
    if (c > n) {
      n = c;
      best = x;
    }
  });
  return best;
}

/* Sample skewness (adjusted Fisher–Pearson, as pandas reports it). */
export function skewness(xs) {
  const n = xs.length;
  if (n < 3) return NaN;
  const m = mean(xs);
  const m2 = sum(xs.map((x) => (x - m) ** 2)) / n;
  const m3 = sum(xs.map((x) => (x - m) ** 3)) / n;
  const g1 = m3 / m2 ** 1.5;
  return (Math.sqrt(n * (n - 1)) / (n - 2)) * g1;
}

/* Histogram counts over [min, max) in `bins` equal-width bins. */
export function histogram(xs, bins, min, max) {
  const counts = new Array(bins).fill(0);
  const w = (max - min) / bins;
  xs.forEach((x) => {
    if (x < min || x > max) return;
    const i = Math.min(bins - 1, Math.floor((x - min) / w));
    counts[i] += 1;
  });
  return counts;
}

/* ---------------------------------------------------------- distributions */

/* erf, Abramowitz & Stegun 7.1.26 — max error 1.5e-7, ample for charts. */
export function erf(x) {
  const s = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-a * a);
  return s * y;
}

export const normPdf = (x, mu = 0, sd = 1) =>
  Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
export const normCdf = (x, mu = 0, sd = 1) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)));

/* Inverse standard-normal CDF (Acklam's rational approximation, ~1e-9). */
export function normInv(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/* log Γ(x), Lanczos approximation. */
export function lgamma(x) {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/* Continued fraction for the incomplete beta function (Numerical Recipes). */
function betacf(a, b, x) {
  const MAXIT = 200;
  const EPS = 3e-14;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/* Regularised incomplete beta I_x(a, b). */
export function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/* Student's t CDF with df degrees of freedom. */
export function tCdf(t, df) {
  const x = df / (df + t * t);
  const tail = 0.5 * betai(df / 2, 0.5, x);
  return t >= 0 ? 1 - tail : tail;
}

/* Inverse t CDF by bisection — plenty fast for a slider. */
export function tInv(p, df) {
  let lo = -60;
  let hi = 60;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* Regularised lower incomplete gamma P(a, x). */
export function gammaP(a, x) {
  if (x <= 0) return 0;
  const gln = lgamma(a);
  if (x < a + 1) {
    let ap = a;
    let del = 1 / a;
    let s = del;
    for (let n = 0; n < 500; n++) {
      ap += 1;
      del *= x / ap;
      s += del;
      if (Math.abs(del) < Math.abs(s) * 1e-15) break;
    }
    return s * Math.exp(-x + a * Math.log(x) - gln);
  }
  // continued fraction for Q, then P = 1 − Q
  let b = x + 1 - a;
  let c = 1 / 1e-300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
}

export const chi2Cdf = (x, df) => gammaP(df / 2, x / 2);

/* F distribution CDF, for ANOVA. */
export const fCdf = (x, d1, d2) => (x <= 0 ? 0 : betai(d1 / 2, d2 / 2, (d1 * x) / (d1 * x + d2)));

/* ---------------------------------------------------------- relationships */

export function pearson(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/* Average ranks (ties share the mean rank), then Pearson on the ranks. */
export function ranks(xs) {
  const idx = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(xs.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}
export const spearman = (xs, ys) => pearson(ranks(xs), ranks(ys));

/* Least-squares line y = a + b·x. */
export function linfit(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const b = sxy / sxx;
  return { a: my - b * mx, b };
}

/* Solve A·x = b by Gaussian elimination with partial pivoting. */
export function solve(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const p = M[col][col];
    if (Math.abs(p) < 1e-12) return null; // singular — perfectly collinear columns
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / p;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/* Ordinary least squares with an intercept. X is rows of features.
   Returns coefficients [b0, b1, …], fitted values, residuals, R², adjusted R². */
export function ols(X, y) {
  const n = X.length;
  const rows = X.map((r) => [1, ...r]);
  const p = rows[0].length;
  const XtX = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0)),
  );
  const Xty = Array.from({ length: p }, (_, i) => rows.reduce((s, r, k) => s + r[i] * y[k], 0));
  const beta = solve(XtX, Xty);
  if (!beta) return null;
  const fitted = rows.map((r) => r.reduce((s, v, i) => s + v * beta[i], 0));
  const resid = y.map((v, i) => v - fitted[i]);
  const my = mean(y);
  const ssTot = sum(y.map((v) => (v - my) ** 2));
  const ssRes = sum(resid.map((e) => e * e));
  const r2 = 1 - ssRes / ssTot;
  const k = p - 1; // predictors, excluding the intercept
  const adjR2 = 1 - ((1 - r2) * (n - 1)) / (n - k - 1);
  const rmse = Math.sqrt(ssRes / n);
  return { beta, fitted, resid, r2, adjR2, rmse, ssRes, ssTot };
}

/* Number formatting helpers used across the pages. */
export const fmt = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "—");
export const pct = (x, d = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "—");
export function fmtP(p) {
  if (!Number.isFinite(p)) return "—";
  if (p < 0.0001) return "< 0.0001";
  return p.toFixed(4);
}
