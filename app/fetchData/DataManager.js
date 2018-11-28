import CONFIG from "../config";
import {
  // fetchDataset,
  fetchQueryResult,
  fetchGBQServerStatus
} from "./fetchData";

/**
 * Class for smartly handling all the data in the app.
 *
 * @class DataManager
 */
class DataManager {
  constructor() {
    this.datasets = new Map();

    this.FIRST_AVAILABLE_GDELT_DATETIME = CONFIG.FIRST_AVAILABLE_GDELT_DATETIME;
    this.LAST_AVAILABLE_GDELT_DATETIME = CONFIG.LAST_AVAILABLE_GDELT_DATETIME;
    this.isGBQAvailable = false;
    // Check GBQ availability as soon as the app is lunched
    this.checkGBQAvailability();
    this.currentData = Object();

    // Subscribed views
    this.subscribedViews = Array();
  }

  checkGBQAvailability() {
    fetchGBQServerStatus()
      .then(data => this.isGBQAvailable = data.active);
  }

  /**
   * TODO
   * Not yet used
   *
   * @param {*} key
   * @param {*} data
   * @memberof DataManager
   */
  store(key, data) {
    this.datasets.set(key, data);
  }


  /**
   * Makes the Google Big Querry request, and send the data to the views
   *
   * @param {*} queryParameters
   * @memberof DataManager
   */
  getQueryDatasetAndUpdateViews(queryParameters) {
    if (this.isGBQAvailable !== true) {
      throw new Error("Server can't make request to Google Big Querry.");
    }

    fetchQueryResult(queryParameters)
      .then(data => this.updateData(data));
  }

  /**
   * Subscribes a view to the instance and returns the currently selected data.
   * Only views that have an updateData function can be subscribed.
   *
   * @param {Object} view The view to subscribe.
   * @returns {Array[Promise]} The currently selected data.
   * @memberof DataManager
   */
  subscribe(view) {
    if (typeof view.updateData !== "function") {
      throw new Error("View should have an updateData function!");
    }
    if (!this.subscribedViews.includes(view)) {
      this.subscribedViews.push(view);
    }
    return this.currentData;
  }

  /**
   * Updates selected data and propagates changes to subscribed views.
   *
   * @param {Array[Promise]} newData
   * @memberof DataManager
   */
  updateData(newData) {
    this.currentData = newData;
    this.subscribedViews.forEach((v) => v.updateData(this.currentData));
  }

}

const dataManagerInstance = new DataManager();
// We export only the instance, we shouldn't use multiple instances of this.
// No need to export the class.
export default dataManagerInstance;
