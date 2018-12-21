import MoveTo from "moveto";

import { fetchServerStatus } from "./fetchData/fetchData";
import dataManagerInstance from "./fetchData/DataManager";
import Dashboard from "./views/dashboard/Dashboard";
import Story from "./Story";
import CONFIG from "./config";
import "../assets/styles/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import WebFont from "webfontloader";

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
    WebFont.load({
      google: {
        families: ["Special Elite"]
      }
    });

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

    fetchServerStatus()
      .then(() => {
        function unHide(cls) {
          for (let el of document.getElementsByClassName(cls)) {
            el.setAttribute("style", ""); // remove the display None when everything is ready
          }
        }

        const story = new Story();
        dataManagerInstance.preFetchDataset(
          CONFIG.PRE_FETCHED_DATASETS[0],
          (data) => {
            unHide("FIRST-DATASET-REQUIRED");
            story.init(data);
            dataManagerInstance.preFetchAllDatasets();
            const dashboard = new Dashboard();
            dashboard.init();
          }
        );

        unHide("API-REQUIRED");
        p.remove();

      })
      .catch(() => {
        p.innerText = "ERROR while starting the server API, please reload the page or contact admin";
      });

  }
}

const appInstance = new App();
export default appInstance;
