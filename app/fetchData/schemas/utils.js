/**
 * dummy function that returns its argument as a String instance.
 *
 * @export
 * @param {string} str string to parse
 * @returns {bool}
 */
export function parseString(str) { return String(str); }


/**
 * Function to parse string to bool
 * '1' => true
 * '0' => false
 *
 * @export
 * @param {string} str string to parse
 * @returns {bool} parsed value
 */
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

// filter a compile schema to keep only the attributes we are interested in
// keysToKeep should be an array of strigns
export function filterCompiledSchema(compiledSchema, keysTokeep) {
  let filtered = {};
  for (const key in compiledSchema) {
    if (keysTokeep.includes(key)) {
      filtered[key] = { ...compiledSchema[key] };
    }
  }
  return filtered;
}
