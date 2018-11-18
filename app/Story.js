import "intersection-observer";
import scrollama from "scrollama";
import * as d3 from "d3";
import Stickyfill from "stickyfilljs";

import "../assets/styles/story.scss";

class Story {
  constructor() {
    this.container = d3.select("#scroll");
    this.graphic = this.container.select(".scroll__graphic");
    this.chart = this.graphic.select(".chart");
    this.text = this.container.select(".scroll__text");
    this.step = this.text.selectAll(".step");
    this.scroller = scrollama();
  }

  // generic window resize listener event
  handleResize() {
    // 1. update height of step elements
    const stepHeight = Math.floor(window.innerHeight * 0.75);
    this.step.style("height", stepHeight + "px");

    // 2. update width/height of graphic element
    const bodyWidth = d3.select("body").node().offsetWidth;
    const textWidth = this.text.node().offsetWidth;

    const graphicWidth = bodyWidth - textWidth;

    this.graphic
      .style("width", graphicWidth + "px")
      .style("height", window.innerHeight + "px");

    const chartMargin = 32;
    const chartWidth = this.graphic.node().offsetWidth - chartMargin;

    this.chart
      .style("width", chartWidth + "px")
      .style("height", Math.floor(window.innerHeight / 2) + "px");


    // 3. tell scrollama to update new element dimensions
    this.scroller.resize();
  }

  // scrollama event handlers
  handleStepEnter(response, self) {
    // response = { element, direction, index }

    // add color to current step only
    self.step.classed("is-active", function (d, i) {
      return i === response.index;
    });

    // update graphic based on step
    this.chart.select("p").text(response.index + 1);
  }

  handleContainerEnter(response) {
    return response;
    // console.log(response);
    // response = { direction }
  }

  handleContainerExit(response) {
    return response;
    // console.log(response);
    // response = { direction }
  }

  setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
      Stickyfill.add(this);
    });
  }

  init() {
    const self = this;
    this.setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    this.handleResize();

    // 2. setup the scroller passing options
    // this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    this.scroller.setup({
      container: "#scroll",
      graphic: ".scroll__graphic",
      text: ".scroll__text",
      step: ".scroll__text .step",
      debug: false,
    })
      .onStepEnter((response) => this.handleStepEnter(response, self))
      .onContainerEnter(this.handleContainerEnter)
      .onContainerExit(this.handleContainerExit);

    // setup resize event
    window.addEventListener("resize", this.handleResize.bind(this));
  }
}

export default Story;
