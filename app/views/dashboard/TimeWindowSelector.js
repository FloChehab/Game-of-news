import * as d3 from "d3";
import dataManagerInstance from "../../fetchData/DataManager";
import "../../../assets/styles/TimeWindowSelector.scss";
import {
  nearestHourDate,
  numberOfHoursBetween,
  absDelayBetweenDates,
  datesAreEqual,
  addHourToDate,
  roundDateTimeToDay,
  strIsoToDate
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

  /**
   *Creates an instance of TimeWindowSelector.
   * @param {Date} highlightedDate
   * @memberof TimeWindowSelector
   */
  constructor(highlightedDate) {
    this.highlightedDate = highlightedDate;

    // Link the date picker
    const datePicker = document.getElementById("dateTimeWindowSelector");
    datePicker.onchange = () => this.updateHighlightedDateAndRedraw(strIsoToDate(datePicker.value));

    this.lastSelection = false;
    this.lastSelectionBrushing = false;
    this.brushGroup = false;

    this.svg = d3.select(DIVID).append("svg")
      //.attr("width", width + margin.left + margin.right)
      //.attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0, 0, ${width + margin.left + margin.right}, ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.xScale = d3.scaleTime()
      .rangeRound([0, width]);
  }


  initAxis() {
    this.updateAxis(this.getAvailableTimeWindow());

    this.group1 = this.svg.append("g")
      .attr("class", "axis axis--grid")
      .attr("transform", "translate(0," + height + ")");
    this.group1.call(this.xAxisGrid);

    this.svg
      .selectAll(".tick")
      .classed("tick--minor", function (d) { return d.getUTCHours(); });

    this.group2 = this.svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")");
    this.group2.call(this.xAxisLabel);

    this.svg
      .attr("text-anchor", null)
      .selectAll("text")
      .attr("x", 6);
  }


  /**
   * Function to update the scale given a new scale,
   * The scale is also stored
   *
   * @param {Array[Date]} newDomain
   * @memberof TimeWindowSelector
   */
  updateAxis(newDomain) {
    this.xScale.domain(newDomain);

    this.xAxisGrid = d3.axisBottom(this.xScale)
      .ticks(d3.timeHour, 1)
      .tickSize(-height)
      .tickFormat(function () { return null; });

    this.xAxisLabel = d3.axisBottom(this.xScale)
      .ticks(d3.timeHour.every(3))
      .tickPadding(3);
  }

  getAvailableTimeWindow() {
    const roundedDate = roundDateTimeToDay(this.highlightedDate);
    return [addHourToDate(roundedDate, -12), addHourToDate(roundedDate, +36)];
  }

  init() {
    // copy reference to this since d3 will bind the svg element to it
    let self = this;

    this.initAxis();

    this.brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush", whileBrushing)
      .on("end", brushingEnded);

    this.svg.append("g")
      .attr("class", "brush")
      .call(this.brush);

    /**
     * Gets the date being selected
     *
     * @returns {Array[Date]}
     */
    function getSelectedDates() {
      if (!d3.event.sourceEvent) return false; // Only when the input is physical (and not due to animation)
      if (!d3.event.selection) return false; // Ignore empty selections.
      return d3.event.selection.map(self.xScale.invert);
    }

    /**
     * Function to tell whether the two limits of the rectangle are moved simultaneously
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

      const roundedSelectedDates = selectedDates.map((date) => nearestHourDate(date));
      const nh = numberOfHoursBetween(...roundedSelectedDates);

      if (nh > CONFIG.MAX_NB_HOURS_GBQ_QUERY && !isRectMoving()) {
        // we limit the number of intervals that can be fetch
        d3.select(this).call(d3.event.target.move, self.lastSelectionBrushing.map(self.xScale));
        setSelectionClass("out-of-range");
      } else {
        if (roundedSelectedDates[0].getTime() < dataManagerInstance.FIRST_AVAILABLE_GDELT_DATETIME.getTime() ||
          roundedSelectedDates[1].getTime() > dataManagerInstance.LAST_AVAILABLE_GDELT_DATETIME.getTime()) {
          d3.select(this).call(d3.event.target.move, self.lastSelectionBrushing.map(self.xScale));
          setSelectionClass("out-of-range");
        } else {
          self.lastSelectionBrushing = roundedSelectedDates;
          setSelectionClass("");
        }
      }
    }

    /**
     * Function called after brushing ended
     *
     */
    function brushingEnded() {
      if (self.brushGroup === false) {
        self.brushGroup = this; // store the element for later animation (this is not the class here, self is)
      }

      // Make sure the out-of range class is removed
      setSelectionClass("");
      const selectedDates = getSelectedDates();
      if (selectedDates === false) return;

      let roundedSelectedDates = selectedDates.map((date) => nearestHourDate(date));

      if (self.lastSelection !== false) {
        // If the delay between the two hasn't change, assume the two limits
        // of the rectangle have been moved simultaneously
        if (isRectMoving()) {
          const prevD1 = self.lastSelection[0],
            currD1 = roundedSelectedDates[0];
          const roundingOperator = currD1 < prevD1 ? Math.floor : Math.ceil;
          roundedSelectedDates = selectedDates.map(
            (date) => nearestHourDate(date, roundingOperator)
          );
        }
      }

      // handle the fact that sometime two dates can be the same
      if (datesAreEqual(...roundedSelectedDates)) {
        const d1 = roundedSelectedDates[1];
        roundedSelectedDates[1] = nearestHourDate(
          new Date(d1.getTime() + 1), Math.ceil);
      }

      self.updateSelectionnedDateAndTellDataManager(roundedSelectedDates);

      d3.select(this).transition().call(d3.event.target.move, roundedSelectedDates.map(self.xScale));
    }
  }

  updateSelectionnedDateAndTellDataManager(dates) {
    this.lastSelection = dates;
    dataManagerInstance.getQueryDatasetAndUpdateViews({
      date_begin: dates[0].toJSON(),
      date_end: dates[1].toJSON()
    });
  }

  updateHighlightedDateAndRedraw(date) {
    this.highlightedDate = date;

    this.updateAxis(this.getAvailableTimeWindow());

    const dur = 1000;

    this.group1
      .transition()
      .duration(dur)
      .call(this.xAxisGrid);

    this.group2
      .transition()
      .duration(dur)
      .call(this.xAxisLabel);

    if (this.brushGroup !== false) {
      // the brush has been used once, we should update its position too.
      d3.select(this.brushGroup)
        .transition()
        .duration(dur)
        .call(this.brush.move, this.lastSelectionBrushing.map(this.xScale));
    }

  }
}

export default TimeWindowSelector;
