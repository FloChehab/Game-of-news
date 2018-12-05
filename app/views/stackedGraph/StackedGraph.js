import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import "../../../assets/styles/StackedGraph.scss";
//import _ from "lodash";

class StackedGraph {
  constructor(context) {
    this.context = context;
    this.svg = {};

    // Current data provided by the Data Manager
    this.data = {
      dates: Array(),
      streamgraph: Array(),
      drilldown: Array()
    };

    // Data for the active view of the graph (Streamgraph/Drilldown)
    this.active = {
      data: Array(),
      view: "streamgraph",
      layerIDs: Array()
    };
  }

  init() {
    this.svg = d3.select(this.context)
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0, 1000, 500");

    dataManagerInstance.subscribe(this);
  }

  updateData(data) {
    const update = data.stackedGraph;
    update.dates = update.dates.map((d) => new Date(d));
    Object.assign(this.data, update);

    this.setActiveData();
    this.updateViz();
  }

  setActiveData() {
    if (this.active.view == "streamgraph") {
      this.active.data = this.data.streamgraph;
    } else if (this.active.view == "drilldown") {
      this.active.data = this.data.drilldown;
    } else {
      throw new Error("View undefined");
    }

    this.active.layerIDs = (() => {
      const ids = Object.keys(this.active.data[0]);
      ids.pop("mentionInterval");
      return ids;
    })();
  }

  updateViz() {
    const firstDate = this.data.dates[0],
      lastDate = this.data.dates[1];

    const x = d3.scaleTime()
      .domain([firstDate, lastDate])
      .range([0, 1000]);

    const y = d3.scaleLinear()
      .range([400, 0]);

    const area = d3.area()
      .curve(d3.curveBasis)
      .x((d) => x(new Date(d.data.mentionInterval)))
      .y((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const z = d3.interpolateSpectral;

    const axis = d3.axisBottom()
      .scale(x);

    const stack = d3.stack()
      .keys(this.active.layerIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);

    const layers = stack(this.active.data);
    y.domain([
      d3.min(layers, l => d3.min(l, d => d[0])),
      d3.max(layers, l => d3.max(l, d => d[1]))
    ]);

    this.svg.selectAll("path")
      .data(layers)
      .enter().append("path")
        .attr("class", "stackedLayer")
        .attr("d", area)
        .attr("fill", () => z(Math.random()));

    this.svg.selectAll(".stackedLayer")
      .attr("opacity", 1)
      .on("mouseover", (d, i) =>
        this.svg.selectAll(".stackedLayer")
          .transition()
          .duration(200)
          .attr("opacity", (d, j) => j != i ? 0.6 : 1)
          .style("cursor", "pointer")
      )
      .on("mouseout", () =>
        this.svg.selectAll(".stackedLayer")
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .style("cursor", "default")
      );

    this.svg.select("#stackedAxis").remove();
    this.svg.append("g")
      .attr("id", "stackedAxis")
      //.attr("transform", `translate(0, ${this.svg.attr("height")-30})`)//todo change magic number
      .attr("transform", "translate(0, 400)")
      .call(axis);
  }
}

export default StackedGraph;
