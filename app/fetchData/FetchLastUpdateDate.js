import CONFIG from "../config.js";
import dateFromStrDateTime from "./utils/dateFromStrDateTime.js";

/**
 * Class to handle the fetch of the max datetime where the CSV is available
 *
 * @class FetchLastUpdateDate
 */
class FetchLastUpdateDate {

  constructor() {
    // Let's make sure the stored date by default evaluate to false
    this.date = false;
  }

  /**
   *  Get the already stored date or fetch a new one.
   *
   * @param {boolean} [force=false] Do we force getting a new value ?
   * @returns {Promise({success: bool, data: Date})} when sucessful; {success: false, error} when unsuccessful
   * @memberof FetchLastUpdateDate
   */
  async get(force = false) {
    if (force !== false && this.date !== false) {
      // wrap the already obtained data in a Promise for homogenity
      return new Promise(resolve => {
        resolve(this.buildCurrentResponse());
      });
    }

    try {
      const response = await fetch(CONFIG.END_POINT_LIVE_GDELT_DATA + CONFIG.BASE_END_POINT_GDELT_LAST_UPDATE_CSV);
      const txt = await response.text();
      this.date = this.parse(txt);
      return this.buildCurrentResponse();
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Parse a string like 140798 db1656643ba5a4bed625cabcdb0fa25a http://data.gdeltproject.org/gdeltv2/20181109151500.translation.export.CSV.zip
   *  To extract: 20181109151500
   *  And convert it to date
   * @param {String} data
   * @returns {Date}
   * @memberof FetchLastUpdateDate
   */
  parse(data) {
    const regExpDate = /http.*\/(\d+)\.translation\.export\.CSV\.zip/;
    const dateStr = regExpDate.exec(data)[1];
    return dateFromStrDateTime(dateStr);
  }

  buildCurrentResponse() {
    if (this.date === false) {
      throw "Date is not initialized";
    }

    return { success: true, data: this.date };
  }
}

const fetchLastUpdateDateInstance = new FetchLastUpdateDate();
// We export only the instance, we shouldn't use multiple instances of this.
// No need to export the class.
export default fetchLastUpdateDateInstance;
