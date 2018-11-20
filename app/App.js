import MoveTo from "moveto";

import fetchLastUpdateDateInstance from "./fetchData/FetchLastUpdateDate";
import dataManagerInstance from "./fetchData/DataManager";
import Dashboard from "./views/dashboard/Dashboard";
import Story from "./Story";
import "../assets/styles/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";
// import { format } from "path";

/**
 * Class the manages all the app
 *
 * @class App
 */
class App {
  constructor() { }

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

    const easeFunctions = {
      easeInQuad: function (t, b, c, d) {
        t /= d;
        return c * t * t + b;
      },
      easeOutQuad: function (t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
      }
    };

    const moveTo = new MoveTo({
      ease: "easeInQuad"
    }, easeFunctions);
    const triggers = document.getElementsByClassName("js-trigger");
    for (const trigger of triggers) {
      moveTo.registerTrigger(trigger);
    }

    fetchLastUpdateDateInstance.get()
      .then(data => {
        if (!data.success) {
          p.innerText = "ERROR while starting API, please reload the page or contact admin";
        } else {
          for (let el of document.getElementsByClassName("API-REQUIRED")) {
            el.setAttribute("style", ""); // remove the display None when everything is ready
          }

          dataManagerInstance.setLastFetchableDateTime(data.data);
          p.remove();

          const story = new Story();
          story.init();
          const dashboard = new Dashboard();
          dashboard.init();
        }
      });

  }
}

const appInstance = new App();
export default appInstance;