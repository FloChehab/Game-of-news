import CONFIG from "../config";
import fetchEventsMentions from "./fetchEventsMentions";


/**
 * Class for smartly handling all the data in the app.
 *
 * @class DataManager
 */
class DataManager {
  constructor() {
    this.max15MinIntervals = CONFIG.MAX_15_MIN_INTERVALS;
    this.intervalData = new Map();
  }

  getMax15MinIntervals() { return this.max15MinIntervals; }
  setMax15MinIntervals(val) { this.max15MinIntervals = val; }

  store(key, data) {
    this.intervalData.set(key, { data, storedOn: new Date() });
  }

  /**
   * Check that the current size of the intervalData map
   * is not too big, for memory concerns.
   *
   * If the map is too big, then the last used value is removed.
   *
   * @memberof DataManager
   */
  checkSize() {
    const size = this.intervalData.size;
    let minStoredOn = { date: new Date(), key: null };
    if (size > this.max15MinIntervals) {
      // clean for memory limitations
      for (const [key, { date }] of this.intervalData) {
        if (date < minStoredOn.date) {
          minStoredOn.date = date;
          minStoredOn.key = key;
        }
      }
      this.intervalData.delete(minStoredOn.key);
    }
  }

  /**
   * Return a Promise with the data (mentions merged with events) for a given date.
   *
   * @param {Date} date
   * @returns Promise({success: bool, data: Array})
   * @memberof DataManager
   */
  async get15MinData(date) {
    if (this.intervalData.has(date)) {
      const data = this.intervalData.get(date).data;
      this.store(date, data); // update storing date
      return new Promise((success) => success(data));
    } else {
      const data = await fetchEventsMentions(date);
      this.checkSize();
      this.store(date, data);
      return new Promise((success) => success(data));
    }
  }
}

const dataManagerInstance = new DataManager();
// We export only the instance, we shouldn't use multiple instances of this.
// No need to export the class.
export default dataManagerInstance;
