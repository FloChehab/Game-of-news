
class TSVParser {

  /**
   *Creates an instance of TSVParser.
   * @param {Object} rowSchema {keyTokeep: {col: colNumber, parser: parsingFunction}}
   * @param {function} filter filter to apply to the data after parsing
   * @memberof TSVParser
   */
  constructor(rowSchema, filter = () => true) {
    this.rowSchema = rowSchema;
    this.filter = filter;
  }

  /**
   *  Parse a Row
   *
   * @param {string} row
   * @returns {Object} Object containing the parsed data according to the parsers in rowSchemas
   */
  parseRow(row) {
    let res = {};
    const { rowSchema } = this;
    for (const key in rowSchema) {
      const keyConfig = rowSchema[key];
      const strVal = row[keyConfig.col];
      res[key] = keyConfig.parser(strVal);
    }
    return res;
  }

  /**
   * Parse a TSV text:
   * For each line and according to a scheam, an object is returned
   *
   * @export
   * @param {string} tsvTxt
   * @returns {Array[Object]}
   */
  parse(tsvTxt) {
    return tsvTxt.split("\n")
      .map(l => l.split("\t"))
      .map(r => this.parseRow(r))
      .filter(this.filter);
  }
}

export default TSVParser;
