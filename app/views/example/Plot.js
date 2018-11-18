// import * as d3 from "d3";
import CONFIG from "../../config";
import dataManagerInstance from "../../fetchData/DataManager";
import { dateGenerator } from "../../fetchData/utils/datesBetween";


class Plot {
  constructor() {
    this.data = Array();
    this.generator = dateGenerator(CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME);
  }

  init() {
    const appDiv = document.getElementById("app");
    let div = document.createElement("div");
    div.setAttribute("id", "dumbPlot");
    appDiv.appendChild(div);

    const bunchOfData = dataManagerInstance.getSampleData(10);
    Promise.all(bunchOfData)
      .then((allData) => {
        allData.forEach(data => this.append(data));
        this.update();
      });

  }

  append(data) {
    this.data.push(data);
  }

  update() {
    const plotDiv = document.getElementById("dumbPlot");
    plotDiv.innerHTML = "";

    for (const d of this.data) {
      if (d.success) {
        let p = document.createElement("p");
        p.textContent = `date: ${String(d.date)} | count: ${d.data.length}`;
        plotDiv.appendChild(p);
      }
    }
  }
}

export default Plot;
