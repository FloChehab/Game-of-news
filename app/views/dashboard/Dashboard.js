import React from "react";
import ReactDOM from "react-dom";

import TimeWindowSelector from "./TimeWindowSelector";
import dataManagerInstance from "../../fetchData/DataManager";
import { dateToStrIso } from "./utils/dateManipulations";
import CONFIG from "../../config";
import Graph from "../graph/Graph";
import StackedGraph from "../stackedGraph/StackedGraph";
import ViewMode from "./ViewMode";

/**
 * Function to capitalize a string (first letter of the string is uppercase)
 *
 * @returns
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function initSelectDataset() {

  /**
   * Converts a string like test_1.json
   * to
   * Test 1
   *
   * @param {string} str
   */
  function niceDatasetName(str) {
    let res = str.split(".")[0]; // Leave out the .json
    res = res.split("_").join(" ");
    return res.capitalize();
  }

  let select = document.getElementById("dashboardSelectDataset");
  for (const dataset of CONFIG.PRE_FETCHED_DATASETS) {
    const option = document.createElement("option");
    option.text = niceDatasetName(dataset + "  | TODO nicer text");
    option.value = dataset;
    select.add(option);
  }

  select.onchange = () => {
    dataManagerInstance.getDatasetAndUpdateViews(select.value);
  };

}

/**
 * Function that sets the datePicker field to the correct value + with the correct time limit.
 * It also returns the selected date.
 *
 * @returns {Date}
 */
function setUpDateWindowSlector() {
  const datePicker = document.getElementById("dateTimeWindowSelector");
  const first = dataManagerInstance.FIRST_AVAILABLE_GDELT_DATETIME,
    last = dataManagerInstance.LAST_AVAILABLE_GDELT_DATETIME;

  datePicker.setAttribute("min", dateToStrIso(first));
  datePicker.setAttribute("max", dateToStrIso(last));
  datePicker.setAttribute("value", dateToStrIso(last));

  return last;
}

class Dashboard {
  constructor() { }

  init() {
    initSelectDataset();
    const highlightedDate = setUpDateWindowSlector();
    new TimeWindowSelector(highlightedDate).init();

    new Graph(
      document.getElementById("dashboardGraph"),
      document.getElementById("dashboardGraphParams")
    ).init();

    //Add random streamgraph handleResize
    new StackedGraph(document.getElementById("dashboardStackedGraphPlot")).init();
    // Force init with first dataset
    dataManagerInstance.getDatasetAndUpdateViews(CONFIG.PRE_FETCHED_DATASETS[0]);

    ReactDOM.render(<ViewMode />, document.getElementById("dashboardViewsSelect"));
  }
}

export default Dashboard;
