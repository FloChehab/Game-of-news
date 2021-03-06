import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import { getDataHover } from "./getDataHover";
import "../../../assets/styles/StackedGraph.scss";

class StackedGraph {
  constructor(context) {
    this.context = context;
    this.legend = {};
    this.chart = {};
    this.axis = {};

    // Inspired by: https://matplotlib.org/examples/color/colormaps_reference.html
    // Set3 with a bit more saturation and some inversion in the last color to remove the grey.
    this.colors = [
      "#6bd8c8",
      "#feff92",
      "#beb9e7",
      "#fe655c",
      "#64b4e5",
      "#feac2b",
      "#a0e326",
      "#ffc7ea",
      "#feee0e",
      "#cb75ce",
      // "#d9d9d9",
      // "#c3eeb8",
    ];

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

  init(subscribe = true) {
    // Need to create some html elements to support the plot
    let create = (type) => document.createElement(type);
    let legend = create("div");
    legend.setAttribute("class", "StackedGraphLegend");

    let sources = create("ul");
    sources.setAttribute("class", "list-group StackedGraphSources");

    let linkBackDiv = create("div");
    linkBackDiv.setAttribute("class", "linkToGlobalView");

    let linkBack = create("a");
    linkBack.setAttribute("href", "#");
    linkBack.setAttribute("class", "btn btn-secondary");
    linkBack.setAttribute("style", "text-decoration: none; visibility: hidden");
    linkBack.innerText = "Back to global view";

    let plotDiv = create("div");
    plotDiv.setAttribute("class", "StackedGraphPlot");

    this.context.appendChild(legend);
    this.context.appendChild(plotDiv);
    legend.appendChild(sources);
    legend.appendChild(linkBackDiv);
    linkBackDiv.appendChild(linkBack);
    // End of html element creation

    const svg = d3.select(plotDiv)
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0, 1000, 500");
    this.legend = d3.select(sources);

    this.chart = svg.append("g")
      .attr("class", "stackedChart");

    this.axis = svg.append("g")
      .attr("class", "stackedAxis")
      .attr("transform", "translate(0, 450)");

    if (subscribe){
      dataManagerInstance.subscribe(this);
    }
  }

  updateData(data) {
    // Handle incoming data dates
    let update = data.stackedGraph;
    update.dates = update.dates.map((d) => new Date(d));
    for (let site in update.drilldown) {
      for (let interval of update.drilldown[site]) {
        interval.mentionInterval = new Date(interval.mentionInterval);
      }
    }

    for (let obj of update.streamgraph) {
      obj.mentionInterval = new Date(obj.mentionInterval);
    }

    // Update view data
    this.data = update;

    // Update viz data
    this.active.layerIDs = Object.keys(update.streamgraph[0])
      .filter(id => id !== "mentionInterval");
    this.active.nullStack = (() => d3.stack().keys(["nullArea"])(
      this.data.dates.map((d) => ({mentionInterval: d, nullArea: true})))[0]
    )();

    // Update viz
    this.generateStreamgraph();
  }

  generateStreamgraph() {
    d3.select(this.context).select(".linkToGlobalView a")
      .style("visibility", "hidden")
      .on("click", null);

    const stack = d3.stack()
      .keys(this.active.layerIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);
    const data = stack(this.data.streamgraph);

    //let chroma = (k, i) => d3.interpolateYlGnBu(i / this.active.layerIDs.length)
    //let chroma = (k, i) => d3.schemeSet3[i];
    let chroma = (k, i) => this.colors[i];

    this.updateLegend(
      data.concat().sort((a, b) => b.index - a.index).map((d) =>
        [d.key, d.index, chroma(d.key, d.index)])
    );

    this.updateViz(
      data, chroma
    ).on("click", (d) => this.generateDrilldown(d.key));
  }

  generateDrilldown(k) {
    d3.select(this.context).selectAll(".list-group-item")
      .style("background-color", "white");
    const legendItem = d3.select(`#${this.getLegendElemId(k)}`);
    legendItem.style("background-color", legendItem.attr("data-color"));

    d3.select(this.context).select(".linkToGlobalView a")
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
      //.on("mouseover", null)
      //.on("mouseout", null)
      .on("click", null);
  }

  updateViz(data, chroma, source) {
    let self = this;

    d3.select(self.context).select(".stackedVertical").remove();
    d3.select(self.context).select(".stackedTooltip").remove();
    d3.select(self.context).select(".stackedTooltipText").remove();

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
      .x((d) => x(d.data.mentionInterval))
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
          .call(fadeLayers, 200, (d) => d.index != index ? 0.5 : 1);
      } else {
        legendItem.style("cursor", "default");
        path.style("cursor", "default")
          .call(fadeLayers, 200, 1);
      }
    }

    const vertical = this.chart.append("line")
      .attr("class", "stackedVertical")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 450)
      .style("stroke-width", 1)
      .style("stroke", "gray")
      .style("fill", "none")
      .style("display", "none")
      .style("pointer-events", "none");

    const tooltipG = this.chart.append("g");
    const tooltip = tooltipG.append("rect")
      .attr("class", "stackedTooltip")
      .attr("x", 50)
      .attr("y", 50)
      .attr("width", 50)
      .attr("height", 30)
      .attr("fill", "white")
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("rx", 15)
      .attr("ry", 15)
      .style("display", "none")
      .style("pointer-events", "none");


    const tooltipText = tooltipG.append("text")
      .attr("class", "stackedTooltipText")
      .attr("x", 75)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .text("")
      .style("display", "none")
      .style("pointer-events", "none");

    const layers = this.chart.selectAll(".stackedLayer");
    layers
      .on("mouseover", (d) => {
        if (typeof source == "undefined") {
          const legendItem = d3.select(self.context).select(`#${this.getLegendElemId(d.key)}`);
          layers.call(highlightLayer, d.key, d.index, true, legendItem, legendItem.attr("data-color"));
        }
        vertical.style("display" , "initial");
        tooltip.style("display" , "initial");
        tooltipText.style("display" , "initial");
      })
      .on("mousemove", function(d) {
        const coordinates = d3.mouse(this);
        const verticalDate = x.invert(coordinates[0]);
        const allData = d.map( v => v.data );
        const count = Math.round(getDataHover(verticalDate, allData, d.key));

        vertical
          .attr("x1", coordinates[0]-2)
          .attr("x2", coordinates[0]-2);
        tooltip
          .attr("x", coordinates[0]+10)
          .attr("y", coordinates[1]-50);
        tooltipText
          .attr("x", coordinates[0]+35)
          .attr("y", coordinates[1]-30)
          .text("≈" + count);
      })
      .on("mouseout", (d) => {
        if (typeof source === "undefined") {
          const legendItem = d3.select(self.context).select(`#${this.getLegendElemId(d.key)}`);
          layers.call(highlightLayer, -1, -1, false, legendItem, "white");
        }
        vertical.style("display" , "none");
        tooltip.style("display" , "none");
        tooltipText.style("display" , "none");
      });
    const legendLayers = this.legend.selectAll(".list-group-item");
    const context = this;
    legendLayers
      .on("mouseover", function() {
        const legendItem = d3.select(this);
        layers.call(highlightLayer, this.dataset.key, this.dataset.index,
          typeof source == "undefined", legendItem, this.dataset.color);
        legendItem.style("cursor", "pointer");
      })
      .on("mouseout", function() {
        const legendItem = d3.select(this);
        if (typeof source == "undefined" || this.dataset.key !== source) {
          layers.call(highlightLayer, -1, -1, false, legendItem, "white");
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
