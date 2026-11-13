import React from "react";

// Token rules for lightweight, dependency-free syntax highlighting
const PYTHON_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
  "del", "elif", "else", "except", "finally", "for", "from", "global", "if",
  "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield", "None", "True", "False", "self"
]);

const JS_KEYWORDS = new Set([
  "await", "break", "case", "catch", "class", "const", "continue", "debugger",
  "default", "delete", "do", "else", "export", "extends", "finally", "for",
  "function", "if", "import", "in", "instanceof", "let", "new", "return",
  "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while",
  "with", "yield", "null", "undefined", "true", "false"
]);

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "insert", "into", "values", "update", "delete",
  "create", "table", "alter", "drop", "index", "join", "left", "right", "inner",
  "outer", "on", "group", "by", "order", "asc", "desc", "having", "limit",
  "offset", "union", "distinct", "as", "and", "or", "not", "null", "like", "in"
]);

export function highlightLine(line, lang = "python") {
  const language = (lang || "").toLowerCase();
  const isPython = language.includes("py");
  const isJS = language.includes("js") || language.includes("ts") || language.includes("json");
  const isSQL = language.includes("sql");
  const isBash = language.includes("bash") || language.includes("sh");

  // Regex patterns
  // 1. Strings (single, double, template, raw/f-strings)
  // 2. Comments (# or //)
  // 3. Numbers
  // 4. Words (identifiers, keywords)
  // 5. Decorators (@name)
  // 6. Others
  
  const tokens = [];
  let remaining = line;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Comments
    if (isPython || isBash) {
      const commentIdx = remaining.indexOf("#");
      if (commentIdx === 0) {
        tokens.push(
          <span key={keyIndex++} className="text-gray-500 italic">
            {remaining}
          </span>
        );
        break;
      }
    }
    if (isJS || isSQL) {
      if (remaining.startsWith("//") || remaining.startsWith("--")) {
        tokens.push(
          <span key={keyIndex++} className="text-gray-500 italic">
            {remaining}
          </span>
        );
        break;
      }
    }

    // 2. Python decorators
    if (isPython && remaining.startsWith("@")) {
      const match = remaining.match(/^@[a-zA-Z0-9_.]+/);
      if (match) {
        tokens.push(
          <span key={keyIndex++} className="text-amber-400 font-medium">
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // 3. Strings
    // Check for f"..." or r"..." or bare string
    const strMatch = remaining.match(/^([bfrBFR]{0,2})("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/);
    if (strMatch) {
      const prefix = strMatch[1];
      const strContent = strMatch[2];
      if (prefix) {
        tokens.push(<span key={keyIndex++} className="text-purple-400">{prefix}</span>);
      }
      tokens.push(
        <span key={keyIndex++} className="text-emerald-300">
          {strContent}
        </span>
      );
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // 4. Numbers
    const numMatch = remaining.match(/^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?\b/);
    if (numMatch) {
      tokens.push(
        <span key={keyIndex++} className="text-amber-300 font-mono">
          {numMatch[0]}
        </span>
      );
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // 5. Words (keywords, functions, variables)
    const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const lower = word.toLowerCase();

      let isKw = false;
      if (isPython && PYTHON_KEYWORDS.has(word)) isKw = true;
      else if (isJS && JS_KEYWORDS.has(word)) isKw = true;
      else if (isSQL && SQL_KEYWORDS.has(lower)) isKw = true;

      if (isKw) {
        tokens.push(
          <span key={keyIndex++} className="text-purple-400 font-semibold">
            {word}
          </span>
        );
      } else {
        // Check if followed by '(' (function call)
        const after = remaining.slice(word.length);
        if (/^\s*\(/.test(after)) {
          tokens.push(
            <span key={keyIndex++} className="text-blue-300">
              {word}
            </span>
          );
        } else if (["self", "cls"].includes(word)) {
          tokens.push(
            <span key={keyIndex++} className="text-rose-400 italic">
              {word}
            </span>
          );
        } else if (["torch", "np", "pd", "plt", "nn", "os", "sys", "json", "math"].includes(word)) {
          tokens.push(
            <span key={keyIndex++} className="text-sky-300 font-medium">
              {word}
            </span>
          );
        } else {
          tokens.push(
            <span key={keyIndex++} className="text-gray-200">
              {word}
            </span>
          );
        }
      }

      remaining = remaining.slice(word.length);
      continue;
    }

    // 6. Whitespace or punctuation
    const punctMatch = remaining.match(/^(\s+|[^\w\s"'`#@]+)/);
    if (punctMatch) {
      tokens.push(
        <span key={keyIndex++} className="text-gray-400">
          {punctMatch[0]}
        </span>
      );
      remaining = remaining.slice(punctMatch[0].length);
      continue;
    }

    // Fallback single character
    tokens.push(<span key={keyIndex++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return tokens;
}
