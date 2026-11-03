/**
 * Extracts a value from a root object using a dot/bracket path string.
 *
 * Path syntax: dot-separated keys (`a.b.c`) and bracket indices (`a[0].b`).
 * Bracket notation is only for array indices; object keys must use dot notation.
 * A path that does not exist returns `{ value: undefined, exists: false }`.
 * If an intermediate value is null or undefined, the path is considered missing.
 *
 * @param {string} path - The path string, e.g. "a.b[0].c".
 * @param {object|array} root - The root object or array to traverse.
 * @returns {{ value: any, exists: boolean }} The value at the path and whether it exists.
 */
export function extractPathValue(path, root) {
  // Empty path is treated as missing; it does not refer to the root itself.
  if (typeof path !== 'string' || path.length === 0) {
    return { value: undefined, exists: false };
  }

  // Tokenize: split on dots that are not inside brackets.
  // Bracket segments are handled separately to support indices like [0].
  const tokens = [];
  let current = '';
  let inBracket = false;
  for (let i = 0; i < path.length; i++) {
    const ch = path[i];
    if (ch === '[') {
      if (!inBracket && current !== '') {
        tokens.push(current);
        current = '';
      }
      inBracket = true;
    } else if (ch === ']') {
      if (!inBracket) {
        // Unmatched closing bracket: treat as literal character in the token.
        current += ch;
      } else {
        if (current !== '') {
          tokens.push(current);
          current = '';
        }
        inBracket = false;
      }
    } else if (ch === '.' && !inBracket) {
      if (current !== '') {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current !== '') {
    tokens.push(current);
  }

  let value = root;
  for (const token of tokens) {
    if (value === null || value === undefined) {
      return { value: undefined, exists: false };
    }
    if (typeof value !== 'object' && typeof value !== 'function') {
      return { value: undefined, exists: false };
    }

    // Array index: token is a non-negative integer string.
    if (Array.isArray(value) && /^\d+$/.test(token)) {
      const index = Number(token);
      if (index >= value.length) {
        return { value: undefined, exists: false };
      }
      value = value[index];
    } else {
      // Object property: token is used as-is.
      if (!(token in value)) {
        return { value: undefined, exists: false };
      }
      value = value[token];
    }
  }

  return { value, exists: true };
}
