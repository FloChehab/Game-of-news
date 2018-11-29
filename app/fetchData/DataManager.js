import CONFIG from "../config";
import {
  fetchQueryResult,
  fetchGBQServerStatus,
  fetchDataset
} from "./fetchData";

/**
 * Class for smartly handling all the data in the app.
 *
 * @class DataManager
 */
class DataManager {
  constructor() {
    this.datasetsStorage = new Map();

    this.FIRST_AVAILABLE_GDELT_DATETIME = CONFIG.FIRST_AVAILABLE_GDELT_DATETIME;
    this.LAST_AVAILABLE_GDELT_DATETIME = CONFIG.LAST_AVAILABLE_GDELT_DATETIME;
    this.isGBQAvailable = false;
    // Check GBQ availability as soon as the app is lunched
    this.checkGBQAvailability();

    // Subscribed views
    this.subscribedViews = Array();
  }

  checkGBQAvailability() {
    fetchGBQServerStatus()
      .then(data => {
        if (data.active === true) {
          this.isGBQAvailable = true;
          for (let el of document.getElementsByClassName("API-GDELT-REQUIRED")) {
            if (el.getAttribute("data-required") === "true") {
              el.setAttribute("style", "");
            } else {
              el.setAttribute("style", "display: none;");
            }
          }
        }
      });
  }

  /**
   * Stores a dataset in the memory
   *
   * @param {string} name
   * @param {object} data
   * @memberof DataManager
   */
  storeDataset(name, data) {
    this.datasetsStorage.set(name, data);
  }

  /**
   * Function to prefetch a dataset.
   *
   * @param {string} name
   * @param {function} [callback=() => { }] function that should have an argument for the data that was fetch
   * @memberof DataManager
   */
  preFetchDataset(name, callback = () => { }) {
    fetchDataset(name)
      .then(data => {
        this.storeDataset(name, data);
        callback(data);
      });
  }

  /**
   * Prefetch all datasets declared in the CONFIG file
   * All datasets are recursively / successively fetched.
   * @memberof DataManager
   */
  preFetchAllDatasets() {
    for (const dataset of CONFIG.PRE_FETCHED_DATASETS) {
      if (!this.datasetsStorage.has(dataset)) {
        this.preFetchDataset(dataset, () => this.preFetchAllDatasets());

        // Fetch only one at a time.
        return;
      }
    }
  }

  /**
   *  If needed fetch a dataset or retreive it from an already fetch dataset.
   *  The views are then updated with the relevant data
   *
   * @param {string} name Dataset name
   * @memberof DataManager
   */
  getDatasetAndUpdateViews(name) {
    if (this.datasetsStorage.has(name)) {
      this.updateViewsData(this.datasetsStorage.get(name));
    } else {
      this.preFetchDataset(name, (data) => this.updateViewsData(data));
    }
  }


  /**
   * Makes the Google Big Querry request, and send the data to the views
   *
   * @param {object} queryParameters
   * @memberof DataManager
   */
  getQueryDatasetAndUpdateViews(queryParameters) {
    if (this.isGBQAvailable !== true) {
      throw new Error("Server can't make request to Google Big Querry.");
    }

    fetchQueryResult(queryParameters)
      .then((data) => this.updateViewsData(data));
  }

  /**
   * Subscribes a view to the instance and returns the currently selected data.
   * Only views that have an updateData function can be subscribed.
   *
   * @param {Object} view The view to subscribe.
   * @memberof DataManager
   */
  subscribe(view) {
    if (typeof view.updateData !== "function") {
      throw new Error("View should have an updateData function!");
    }
    if (!this.subscribedViews.includes(view)) {
      this.subscribedViews.push(view);
    }
  }

  /**
   * Updates selected data and propagates changes to subscribed views.
   *
   * @param {object} data
   * @memberof DataManager
   */
  updateViewsData(data) {
    this.subscribedViews.forEach((v) => v.updateData(data));
  }

}

const dataManagerInstance = new DataManager();
// We export only the instance, we shouldn't use multiple instances of this.
// No need to export the class.
export default dataManagerInstance;
