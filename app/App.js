import MoveTo from "moveto";

import { fetchServerStatus } from "./fetchData/fetchData";
import dataManagerInstance from "./fetchData/DataManager";
import Dashboard from "./views/dashboard/Dashboard";
import Story from "./Story";
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
        dataManagerInstance.preFetchAllDatasets();

        for (let el of document.getElementsByClassName("API-REQUIRED")) {
          el.setAttribute("style", ""); // remove the display None when everything is ready
        }
        p.remove();
        const story = new Story();
        story.init();
        const dashboard = new Dashboard();
        dashboard.init();
      })
      .catch(() => {
        p.innerText = "ERROR while starting the server API, please reload the page or contact admin";
      });

  }
}

const appInstance = new App();
export default appInstance;
