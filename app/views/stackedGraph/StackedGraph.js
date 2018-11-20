import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import _ from "lodash";

class StackedGraph {
  constructor(context, numberOfEventsToDisplay) {
    this.context = context;
    this.numberOfEventsToDisplay = numberOfEventsToDisplay;
    this.svg = {};
    this.rawData = Array();
    this.selectedDates = Array();
    this.eventIDs = Array();
    this.data = Array();
  }

  init() {
    // Set up svg
    this.svg = d3.select(this.context)
      .append("svg")
        .attr("width", this.context.clientWidth)
        .attr("height", this.context.clientHeight)
        .attr("viewport", "0, 0, 100, 100");

    this.updateData();
  }

  updateData() {
    const selectedIntervals = dataManagerInstance.data;
    selectedIntervals.then((allIntervals) => {
      allIntervals.forEach((interval) => this.appendData(interval.data));
      this.selectedDates = dataManagerInstance.dates;
      this.processData();
      this.updateViz();
    });
  }

  appendData(data) {
    this.rawData.push.apply(this.rawData, data);
  }

  updateViz() {
    const firstDate = d3.min(this.selectedDates),
      lastDate = d3.max(this.selectedDates);

    const x = d3.scaleTime()
      .domain([firstDate, lastDate])
      .range([0, this.svg.attr("width")]);

    const y = d3.scaleLinear()
      .range([this.svg.attr("height")-40, 0]);//todo change magic number

    const stack = d3.stack()
      .keys(this.eventIDs)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle);

    const layers = stack(this.data);
    y.domain([
      d3.min(layers, l => d3.min(l, d => d[0])),
      d3.max(layers, l => d3.max(l, d => d[1]))
    ]);

    const area = d3.area()
      .curve(d3.curveBasis)
      .x((d) => x(new Date(d.data.mentionDate)))
      .y((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const z = d3.interpolateSpectral;

    const axis = d3.axisBottom()
      .scale(x);

    this.svg.selectAll("path")
      .data(layers)
      .enter().append("path")
        .attr("d", area)
        .attr("fill", () => z(Math.random()));

    this.svg.append("g")
      .attr("transform", `translate(0, ${this.svg.attr("height")-30})`)//todo change magic number
      .call(axis);
  }

  processData() {
    // Drop duplicates for {mentionSourceName, eventId}
    // Keep earliest occurrence
    const uniqueSourcesPerEvent = _(this.rawData)
      .chain()
      .sortBy("mentionDate")
      .uniqBy((i) => [i.mentionSourceName, i.eventId].join())
      .value();

    // Retrieve k eventIDs with most occurrences
    this.eventIDs = _(uniqueSourcesPerEvent)
      .chain()
      .groupBy("eventId")
      .orderBy(((v) => _(v).map("mentionSourceName").size()), "desc")
      .map((v) => v[0].eventId)
      .take(this.numberOfEventsToDisplay)
      .value();

    // Get data to a suitable form for the stacked area plot
    this.data = _(uniqueSourcesPerEvent)
      .chain()
      .filter((d) => _.includes(this.eventIDs, d.eventId))
      .groupBy("mentionDate")
      .map((v, i) => {
        const d = {mentionDate: i};
        this.eventIDs.forEach((eid) => {
          d[eid] = _(v).map("eventId").filter((v) => v == eid).size();
        });
        return d;
      }).value();
  }

}

export default StackedGraph;
