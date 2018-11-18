import TimeWindowSelector from "./TimeWindowSelector";
import dataManagerInstance from "../../fetchData/DataManager";
import { dateToStrIso } from "./utils/dateManipulations";

function setUpDateWindowSlector() {
  const datePicker = document.getElementById("dateTimeWindowSelector");
  const first = dataManagerInstance.FIRST_FETCHABLE_GDELT_CSV_DATETIME,
    last = dataManagerInstance.LAST_FETCHABLE_GDELT_CSV_DATETIME;

  datePicker.setAttribute("min", dateToStrIso(first));
  datePicker.setAttribute("max", dateToStrIso(last));
  datePicker.setAttribute("value", dateToStrIso(last));
}

class Dashboard {
  constructor() { }

  init() {
    setUpDateWindowSlector();
    new TimeWindowSelector().init();
  }

}

export default Dashboard;
