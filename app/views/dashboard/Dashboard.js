import TimeWindowSelector from "./TimeWindowSelector";
import dataManagerInstance from "../../fetchData/DataManager";
import { dateToStrIso } from "./utils/dateManipulations";
import StackedGraph from "../stackedGraph/StackedGraph";

/**
 * Function that sets the datePicker field to the correct value + with the correct time limit.
 * It also returns the selected date.
 *
 * @returns {Date}
 */
function setUpDateWindowSlector() {
  const datePicker = document.getElementById("dateTimeWindowSelector");
  const first = dataManagerInstance.FIRST_FETCHABLE_GDELT_CSV_DATETIME,
    last = dataManagerInstance.LAST_FETCHABLE_GDELT_CSV_DATETIME;

  datePicker.setAttribute("min", dateToStrIso(first));
  datePicker.setAttribute("max", dateToStrIso(last));
  datePicker.setAttribute("value", dateToStrIso(last));

  return last;
}

class Dashboard {
  constructor() { }

  init() {
    const highlightedDate = setUpDateWindowSlector();
    new TimeWindowSelector(highlightedDate).init();

    //Add random streamgraph handleResize
    const stackedGraphContext = document.createElement("div");
    stackedGraphContext.setAttribute("id", "stackedGraph");
    stackedGraphContext.setAttribute("style", "height: 600px");
    document.getElementById("dashboard").appendChild(stackedGraphContext);
    new StackedGraph(stackedGraphContext, 7).init();
  }
}

export default Dashboard;