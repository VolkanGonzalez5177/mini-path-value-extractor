# mini-path-value-extractor

Given a dot or bracket path string and a root object, returns the value at that path plus a flag indicating whether the path existed.

```js
import { extractPathValue } from './src/index.js';

const root = { user: { name: 'Ada', roles: ['admin', 'editor'] } };

console.log(extractPathValue('user.name', root));
// { value: 'Ada', exists: true }

console.log(extractPathValue('user.roles[1]', root));
// { value: 'editor', exists: true }

console.log(extractPathValue('user.age', root));
// { value: undefined, exists: false }
```

## Why this exists

Reading a nested value from a JSON-like object usually means writing a loop that checks every level for `null` or `undefined`. This library does that check in one place and returns both the value and a boolean so callers can distinguish `undefined` because the path is missing from `undefined` because the property exists and holds `undefined`.

The trade-off is that bracket notation is only interpreted as an array index. Object keys must use dot notation; a segment like `a[b]` is treated as the literal key `b` on `a`. This keeps the parser small and predictable, at the cost of not supporting quoted keys or computed property names.

## Edge cases

- An empty path returns `{ value: undefined, exists: false }`.
- Leading and trailing dots are ignored: `.a.b` and `a.b.` both resolve to `a.b`.
- If an intermediate value is `null` or `undefined`, the path is reported as missing, even if the final key would exist.
- A property that exists with value `undefined` returns `{ value: undefined, exists: true }`.
- Bracket indices are non-negative integers; negative or non-numeric indices are treated as object keys.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

