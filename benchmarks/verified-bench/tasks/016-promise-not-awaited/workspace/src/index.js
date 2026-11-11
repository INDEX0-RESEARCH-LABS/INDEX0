async function fetchValue() { return 42; }
export function getValue() { return fetchValue(); }  // bug: not awaited
