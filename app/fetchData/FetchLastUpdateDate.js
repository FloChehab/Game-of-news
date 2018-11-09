import CONFIG from "../config.js";
import dateFromStrDateTime from "./utils/dateFromStrDateTime.js";

/*
 * Class to handle the fetch of the max datetime where the CSV is available
 */
class FetchLastUpdateDate {

  constructor() {
    // Let's make sure the stored date by default evaluate to false
    this.date = false;
  }

  // return a promise containing an object like
  // { success: true, data: date} when sucessful. Date will store the max fetchable time
  // {success: false, error} when unsuccessful
  async get(force = false) {
    if (force !== false && this.date !== false) {
      // wrap the already obtained data in a Promise for homogenity
      return new Promise(resolve => {
        resolve(this.buildCurrentResponse());
      });
    }

    try {
      const response = await fetch(CONFIG.END_POINT_LIVE_GDELT_CSV + CONFIG.BASE_END_POINT_GDELT_LAST_UPDATE_CSV);
      const txt = await response.text();
      this.date = this.parse(txt);
      return this.buildCurrentResponse();
    } catch (error) {
      return { success: false, error };
    }
  }

  // parse a string like:
  // 140798 db1656643ba5a4bed625cabcdb0fa25a http://data.gdeltproject.org/gdeltv2/20181109151500.export.CSV.zip
  // 285348 7e45b59ba283de0cee1f8c9f4983faa0 http://data.gdeltproject.org/gdeltv2/20181109151500.mentions.CSV.zip
  // 11008184 425cde878276c69b8c1b299c98698746 http://data.gdeltproject.org/gdeltv2/20181109151500.gkg.csv.zip
  //
  // To extract: 20181109151500
  // And then convert it to a Date
  parse(data) {
    const regExpDate = /http.*\/(\d+)\.export\.CSV\.zip/;
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

export default FetchLastUpdateDate;
