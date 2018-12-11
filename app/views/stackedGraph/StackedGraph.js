import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import "../../../assets/styles/StackedGraph.scss";
//import _ from "lodash";

class StackedGraph {
  constructor(context) {
    this.context = context;
    this.chart = {};

    // Current data provided by the Data Manager
    this.data = {
      dates: Array(),
      streamgraph: Array(),
      drilldown: Array()
    };

    // Data for the active view of the graph (Streamgraph/Drilldown)
    this.active = {
      data: Array(),
      layerIDs: Array()
    };
  }

  init() {
    // Set up svg
    const svg = d3.select(this.context)
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0, 1000, 500");

    this.chart = svg.append("g")
      .attr("id", "stackedChart");

    this.axis = svg.append("g")
      .attr("id", "stackedAxis")
      .attr("transform", "translate(0, 400)");

    dataManagerInstance.subscribe(this);
  }

  updateData(data) {
    const update = data.stackedGraph;
    update.dates = update.dates.map((d) => new Date(d));
    Object.assign(this.data, update);
    this.active.data = this.data.streamgraph;
    this.active.layerIDs = (() => {
      const ids = Object.keys(update.streamgraph[0]);
      ids.pop("mentionInterval");
      return ids;
    })();
    this.generateStreamgraph();
  }

  generateStreamgraph() {
    const data = this.data.streamgraph;
    const chroma = (d, i) => d3.interpolateSpectral(
      i / this.active.layerIDs.length
    );
    const stack = d3.stack()
      .keys(this.active.layerIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);

    this.updateViz(data, chroma, stack)
      .on("click", (d) => this.generateDrilldown(d.key));
  }

  generateDrilldown(k) {
    const data = this.data.drilldown[k];
    const chroma = (d) => d.key ? d3.color("green") : d3.color("red");
    const stack = d3.stack()
      .keys([true, false])
      .value((d, k) => k ? d[k] : -Math.max(0.0001, d[k]))
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetDiverging);

    this.updateViz(data, chroma, stack)
      .on("click", null);
  }

  updateViz(data, chroma, stack) {
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

    const graphData = stack(data);
    y.domain([
      d3.min(graphData, g => d3.min(g, d => d[0])),
      d3.max(graphData, g => d3.max(g, d => d[1]))
    ]);

    const tooltip = d3.select(this.context)
      .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const u = this.chart.selectAll("path")
      .data(graphData, (d) => d.index);

    u.enter().append("path")
        .attr("class", "stackedLayer")
        .attr("d", "")
        .attr("opacity", 1)
      .merge(u)
        .transition()
        .duration(900)
        .ease(d3.easeQuadOut)
        .attr("d", area)
        .attr("fill", (d, i) => chroma(d, i));

    u.exit().remove();

    this.axis
      .transition()
      .duration(700)
      .ease(d3.easeQuadOut)
      .call(d3.axisBottom().scale(x));

    const layers = this.chart.selectAll(".stackedLayer");
    layers
      .on("mouseover", (d, i) => {
        layers.transition()
          .duration(200)
          .attr("opacity", (d, j) => j != i ? 0.6 : 1)
          .style("cursor", "pointer");
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.key)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY-30) + "px");
      })
      .on("mouseout", () => {
        layers.transition()
          .duration(200)
          .attr("opacity", 1)
          .style("cursor", "default");
        tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        tooltip.html("")
          .style("left", "0px")
          .style("top", "0px");
      });
    return layers;
  }
}

export default StackedGraph;
