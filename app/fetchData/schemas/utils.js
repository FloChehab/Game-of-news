export function parseString(str) { return str; }
export function parseBool(str) { return parseInt(str) === 1; }

// Convert an array of {key: parser}
// to an object {key: {key, parser, row}}
export function compileSchema(schemaDescription) {
  let compiled = {};
  for (let i = 0; i < schemaDescription.length; i++) {
    const col = schemaDescription[i];
    const key = Object.keys(col)[0];
    compiled[key] = { key, col: i, parser: col[key] };
  }
  return compiled;
}

export function filterCompiledSchema(compiledSchema, keysTokeep) {
  let filtered = {};
  for (const key in compiledSchema) {
    if (keysTokeep.includes(key)) {
      filtered[key] = { ...compiledSchema[key] };
    }
  }
  return filtered;
}
