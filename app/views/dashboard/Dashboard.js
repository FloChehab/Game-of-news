import React from "react";
import ReactDOM from "react-dom";

import TimeWindowSelector from "./TimeWindowSelector";
import dataManagerInstance from "../../fetchData/DataManager";
import { dateToStrIso } from "./utils/dateManipulations";
import CONFIG from "../../config";
import Graph from "../graph/Graph";
import StackedGraph from "../stackedGraph/StackedGraph";
import ViewMode from "./ViewMode";

function initSelectDataset() {
  let select = document.getElementById("dashboardSelectDataset");
  for (const dataset of CONFIG.PRE_FETCHED_DATASETS) {
    const option = document.createElement("option");
    option.text = dataset + "  | TODO nicer text";
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
