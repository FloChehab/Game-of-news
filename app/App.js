import CONFIG from "./config";
import fetchLastUpdateDateInstance from "./fetchData/FetchLastUpdateDate";

// import Plot from "./views/example/Plot";
import Dashboard from "./views/dashboard/Dashboard";

/**
 * Class the manages all the app
 *
 * @class App
 */
class App {
  constructor() {
    this.maxDateFetchableCSV = CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME;
  }

  /**
   * Function that should be called first
   *
   * @memberof App
   */
  init() {
    let p = document.createElement("p");
    const pId = "fetchApi-p";
    p.innerText = "API is waking up, please be patient.";
    p.setAttribute("id", pId);
    document.getElementById("app").append(p);

    fetchLastUpdateDateInstance.get()
      .then(data => {
        if (!data.success) {
          p.innerText = "ERROR while starting API, please reload the page or contact admin";
        } else {
          this.maxDateFetchableCSV = data.data;
          p.remove();
          const dashboard = new Dashboard();
          dashboard.init();
        }
      });

  }
}

const appInstance = new App();
export default appInstance;
