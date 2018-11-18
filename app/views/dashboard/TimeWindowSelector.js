import * as d3 from "d3";
// import dataManagerInstance from "../../fetchData/DataManger";
// import { dateGenerator } from "../../fetchData/utils/datesBetween";
import "../../../assets/styles/TimeWindowSelector.scss";
import {
  nearestQuarterDate,
  numberOfQuartersBetween,
  absDelayBetweenDates,
  datesAreEqual
} from "./utils/dateManipulations";

import CONFIG from "../../config";

const DIVID = "#timeWindowSelector";

const margin = { top: 5, right: 40, bottom: 20, left: 40 },
  width = 960 - margin.left - margin.right,
  height = 80 - margin.top - margin.bottom;

function setSelectionClass(cls = "") {
  d3.select(DIVID)
    .select(".selection")
    .attr("class", `selection ${cls}`);
}

class TimeWindowSelector {
  constructor() {
    this.lastSelection = false;
    this.lastSelectionBrushing = false;
  }

  init() {
    let self = this;

    const x = d3.scaleTime()
      .domain([new Date(2013, 7, 1), new Date(2013, 7, 3)])
      .rangeRound([0, width]);

    const svg = d3.select(DIVID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "axis axis--grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(d3.utcMinute, 15)
        .tickSize(-height)
        .tickFormat(function () { return null; }))
      .selectAll(".tick")
      .classed("tick--minor", function (d) { return d.getHours(); });

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(d3.timeHour.every(2))
        .tickPadding(0))
      .attr("text-anchor", null)
      .selectAll("text")
      .attr("x", 6);

    svg.append("g")
      .attr("class", "brush")
      .call(d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush", whileBrushing)
        .on("end", brushingEnded));

    /**
     * Gets the date being selected
     *
     * @returns {Array[Date]}
     */
    function getSelectedDates() {
      if (!d3.event.sourceEvent) return false; // Only when the input is physical (and not due to animation)
      if (!d3.event.selection) return false; // Ignore empty selections.
      return d3.event.selection.map(x.invert);
    }

    /**
     * Function to tell wheter the thow limits of the rectangle are moved simultaneaously
     *
     * @returns {boolean}
     */
    function isRectMoving() {
      const selectedDates = getSelectedDates();
      if (self.lastSelection === false || selectedDates === false) return false;
      return absDelayBetweenDates(...self.lastSelection) === absDelayBetweenDates(...selectedDates);
    }


    /**
     * Function called while there is a brushing on its way
     *
     */
    function whileBrushing() {
      const selectedDates = getSelectedDates();
      if (selectedDates === false) return;

      const roundedSelectedDates = selectedDates.map((date) => nearestQuarterDate(date));
      const nq = numberOfQuartersBetween(...roundedSelectedDates);
      if (nq > CONFIG.MAX_15_MIN_INTERVALS && !isRectMoving()) {
        // we limit the number of intervals that can be fetch
        d3.select(this).call(d3.event.target.move, self.lastSelectionBrushing.map(x));
        setSelectionClass("out-of-range");
      } else {
        self.lastSelectionBrushing = roundedSelectedDates;
        setSelectionClass("");
      }
    }



    /**
     * Function called after brushing ended
     *
     */
    function brushingEnded() {
      // Make sure the out-of range class is removed

      setSelectionClass("");
      const selectedDates = getSelectedDates();
      if (selectedDates === false) return;

      let roundedSelectedDates = selectedDates.map((date) => nearestQuarterDate(date));

      if (self.lastSelection !== false) {
        // If the delay between the two han't change, assume the two limits
        // of the rectange have been moved simultaneaously
        if (isRectMoving()) {
          const prevD1 = self.lastSelection[0],
            currD1 = roundedSelectedDates[0];
          const roundingOperator = currD1 < prevD1 ? Math.floor : Math.ceil;
          roundedSelectedDates = selectedDates.map(
            (date) => nearestQuarterDate(date, roundingOperator)
          );
        }
      }

      // handle the fact that sometime two dates can be the same
      if (datesAreEqual(...roundedSelectedDates)) {
        const d1 = roundedSelectedDates[1];
        roundedSelectedDates[1] = nearestQuarterDate(
          new Date(d1.getTime() + 1), Math.ceil);
      }

      self.lastSelection = roundedSelectedDates;

      d3.select(this).transition().call(d3.event.target.move, roundedSelectedDates.map(x));
    }

  }
}

export default TimeWindowSelector;
