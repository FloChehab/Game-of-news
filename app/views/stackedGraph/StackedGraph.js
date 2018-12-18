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
      .attr("transform", "translate(0, 450)");

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
    d3.select("#linkToGlobalView a")
      .style("visibility", "hidden")
      .on("click", null);

    const stack = d3.stack()
      .keys(this.active.layerIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);
    const data = stack(this.data.streamgraph);

    //let chroma = (k, i) => d3.interpolateYlGnBu(i / this.active.layerIDs.length)
    let chroma = (k, i) => d3.schemeSet3[i];

    this.updateLegend(
      data.concat().sort((a, b) => b.index - a.index).map((d) =>
        [d.key, d.index, chroma(d.key, d.index)])
    );

    this.updateViz(
      data, chroma
    ).on("click", (d) => this.generateDrilldown(d.key));
  }

  generateDrilldown(k) {
    d3.selectAll(".list-group-item")
      .style("background-color", "initial");
    const legendItem = d3.select(`#${this.getLegendElemId(k)}`);
    legendItem.style("background-color", legendItem.attr("data-color"));

    d3.select("#linkToGlobalView a")
      .style("visibility", "visible")
      .on("click", () => {
        d3.event.preventDefault();
        this.generateStreamgraph();
      });

    const stack = d3.stack()
      .keys([true, false])
      .value((d, k) => k ? d[k] : -Math.max(0.0001, d[k]))
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetDiverging);
    const data = stack(this.data.drilldown[k]);

    this.updateViz(
      data, (k) => k ? d3.rgb(0, 168, 107) : d3.rgb(185, 14, 10), k
    )
      .on("mouseover", null)
      .on("mouseout", null)
      .on("click", null);
  }

  updateViz(data, chroma, source) {
    const x = d3.scaleTime()
      .domain([d3.min(this.data.dates), d3.max(this.data.dates)])
      .range([0, 1000]);
    const y = d3.scaleLinear()
      .domain([
        d3.min(data, g => d3.min(g, d => d[0])),
        d3.max(data, g => d3.max(g, d => d[1]))
      ])
      .range([450, 0]);

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
        .attr("id", (d) => this.getLayerId(d.key))
        .attr("d", nullArea)
        .attr("opacity", 0)
      .merge(u)
        .attr("fill", (d) => chroma(d.key, d.index))
        .call(animateLayers, 1200, area, 1);

    u.exit()
      .call(animateLayers, 1200, nullArea, 0)
      .on("end", (d) => d.remove());

    this.axis
      .transition()
      .duration(700)
      .ease(d3.easeQuadOut)
      .call(d3.axisBottom().scale(x));

    function highlightLayer(path, key, index, on, legendItem, color) {
      legendItem.call(fadeLegend, 200, color);
      if (on) {
        legendItem.style("cursor", "pointer");
        path.style("cursor", "pointer")
          .call(fadeLayers, 200, (d) => d.index != index ? 0.3 : 1);
      } else {
        legendItem.style("cursor", "default");
        path.style("cursor", "default")
          .call(fadeLayers, 200, 1);
      }
    }

    const layers = this.chart.selectAll(".stackedLayer");
    layers
      .on("mouseover", (d) => {
        const legendItem = d3.select(`#${this.getLegendElemId(d.key)}`);
        layers.call(highlightLayer, d.key, d.index, true, legendItem, legendItem.attr("data-color"));
      })
      .on("mouseout", (d) => {
        const legendItem = d3.select(`#${this.getLegendElemId(d.key)}`);
        layers.call(highlightLayer, -1, -1, false, legendItem, "initial");
      });
    const legendLayers = this.legend.selectAll(".list-group-item");
    const context = this;
    legendLayers
      .on("mouseover", function() {
        const legendItem = d3.select(this);
        layers.call(highlightLayer, this.dataset.key, this.dataset.index,
          true, legendItem, this.dataset.color);
      })
      .on("mouseout", function() {
        const legendItem = d3.select(this);
        if (typeof source == "undefined" || this.dataset.key !== source) {
          layers.call(highlightLayer, -1, -1, false, legendItem, "initial");
        } else {
          layers.call(highlightLayer, -1, -1, false, legendItem, this.dataset.color);
        }
      })
      .on("click", function() {
        context.generateDrilldown(this.dataset.key);
      });
    return layers;
  }

  updateLegend(layerIDs) {
    this.legend.html("");
    layerIDs.forEach((s) =>
      this.legend.append("li")
        .attr("id", this.getLegendElemId(s[0]))
        .attr("data-key", s[0])
        .attr("data-index", s[1])
        .attr("data-color", s[2])
        .classed("list-group-item", true)
        .html(s[0])
    );
  }

  getLayerId(source) {
    return `stackedPlotLayer-${source}`;
  }

  getLegendElemId(source) {
    return `stackedLegendItem-${source}`;
  }
}

export default StackedGraph;
