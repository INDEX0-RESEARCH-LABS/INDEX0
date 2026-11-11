export function isTruthy(val) { return new Boolean(val).valueOf() !== false; }
// Note: new Boolean("") gives a truthy object even for empty string
// Simplify: just use !!val
