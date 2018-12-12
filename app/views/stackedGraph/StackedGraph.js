import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import "../../../assets/styles/StackedGraph.scss";

class StackedGraph {
  constructor(context) {
    this.context = context;
    this.legend = {};
    this.chart = {};
    this.axis = {};

    // Current data provided by the Data Manager
    this.data = {
      dates: Array(),
      streamgraph: Array(),
      drilldown: Array()
    };

    // Data for the active view of the graph (Streamgraph/Drilldown)
    this.active = {
      layerIDs: Array(),
      nullStack: ""
    };
  }

  init() {
    // Set up svg
    const svg = d3.select(this.context)
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0, 1000, 500");

    this.legend = d3.select("#dashboardStackedGraphSources");

    this.chart = svg.append("g")
      .attr("id", "stackedChart");

    this.axis = svg.append("g")
      .attr("id", "stackedAxis")
      .attr("transform", "translate(0, 400)");

    dataManagerInstance.subscribe(this);
  }

  updateData(data) {
    // Handle incoming data
    const update = data.stackedGraph;
    update.dates = update.dates.map((d) => new Date(d));

    // Update view data
    this.data = update;

    // Update viz data
    this.active.layerIDs = (() => {
      const ids = Object.keys(update.streamgraph[0]);
      ids.pop("mentionInterval");
      return ids;
    })();
    this.active.nullStack = (() => d3.stack().keys(["nullArea"])(
      this.data.dates.map((d) => ({mentionInterval: d, nullArea: true})))[0]
    )();

    // Update viz
    this.generateStreamgraph();
  }

  generateStreamgraph() {
    const stack = d3.stack()
      .keys(this.active.layerIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);
    const data = stack(this.data.streamgraph);

    this.updateLegend(
      data.concat().sort((a, b) => b.index - a.index).map((d) => d.key)
    );

    this.updateViz(
      data, (d, i) => d3.interpolateYlGnBu(i / this.active.layerIDs.length)
    ).on("click", (d) => this.generateDrilldown(d.key));
  }

  generateDrilldown(k) {
    const stack = d3.stack()
      .keys([true, false])
      .value((d, k) => k ? d[k] : -Math.max(0.0001, d[k]))
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetDiverging);
    const data = stack(this.data.drilldown[k]);

    this.updateViz(
      data, (d) => d.key ? d3.rgb(0, 168, 107) : d3.rgb(185, 14, 10)
    ).on("click", null);
  }

  updateViz(data, chroma) {
    const x = d3.scaleTime()
      .domain([d3.min(this.data.dates), d3.max(this.data.dates)])
      .range([0, 1000]);
    const y = d3.scaleLinear()
      .domain([
        d3.min(data, g => d3.min(g, d => d[0])),
        d3.max(data, g => d3.max(g, d => d[1]))
      ])
      .range([400, 0]);

    const area = d3.area()
      .curve(d3.curveBasis)
      .x((d) => x(new Date(d.data.mentionInterval)))
      .y0((d) => d.data.nullArea ? y(0) : y(d[0]))
      .y1((d) => d.data.nullArea ? y(0) : y(d[1]));
    const nullArea = area(this.active.nullStack);

    // Set up animations
    function animateLayers(path, duration, area, opacity) {
      path.transition("animateLayers")
        .duration(duration)
        .ease(d3.easeQuadOut)
        .attr("d", area)
        .attr("opacity", opacity);
    }

    function fadeLayers(path, duration, opacity) {
      path.transition("fadeLayers")
        .duration(duration)
        .attr("opacity", opacity);
    }

    function fadeLegend(item, duration, color) {
      item.transition("fadeLegend")
        .duration(duration)
        .style("background-color", color);
    }

    const u = this.chart.selectAll("path")
      .data(data);
    u.enter().append("path")
        .classed("stackedLayer", true)
        .attr("d", nullArea)
        .attr("opacity", 0)
      .merge(u)
        .attr("fill", (d, i) => chroma(d, i))
        .call(animateLayers, 1200, area, 1);

    u.exit()
      .call(animateLayers, 1200, nullArea, 0)
      .on("end", (d) => d.remove());

    this.axis
      .transition()
      .duration(700)
      .ease(d3.easeQuadOut)
      .call(d3.axisBottom().scale(x));

    const layers = this.chart.selectAll(".stackedLayer");
    layers
      .on("mouseover", (d, i) => {
        d3.select(`#${this.getLegendElemId(d.key)}`)
          .call(fadeLegend, 200, chroma(d, i));
        layers.style("cursor", "pointer")
          .call(fadeLayers, 200, (d, j) => j != i ? 0.3 : 1);
      })
      .on("mouseout", (d) => {
        d3.select(`#${this.getLegendElemId(d.key)}`)
          .call(fadeLegend, 200, "initial");
        layers.style("cursor", "default")
          .call(fadeLayers, 200, 1);
      });
    return layers;
  }

  updateLegend(layerIDs) {
    this.legend.html("");
    layerIDs.forEach((s) =>
      this.legend.append("li")
        .attr("id", this.getLegendElemId(s))
        .classed("list-group-item", true)
        .html(s)
    );
  }

  getLegendElemId(source) {
    return `dashboardStackedGraph-${source.split(".")[0]}`;
  }
}

export default StackedGraph;
