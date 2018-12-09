import React from "react";
import ReactDOM from "react-dom";
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
// import _ from "lodash";
import dataManagerInstance from "../../fetchData/DataManager";
import { buildEdgeId } from "./Ids";
// import { runInThismainContext } from "vm";
import "../../../assets/styles/Graph.scss";

import { edgesToMap } from "./edgesToMap";
import { GraphParamBox } from "./paramBox";


const VIEW_MODE_OVERVIEW = 0;
const VIEW_MODE_DETAILS = 1;

const NODE_SOURCE_COLOR = "grey";
const NODE_EVENT_COLOR = "orange";


class Graph {
  constructor(mainContext, paramContext) {

    this.mainContext = mainContext;
    this.paramContext = paramContext;
    this.rawData = Object();
    this.connections = {};
    this.generalElements = Array();
    this.viewMode = undefined;

    // Parameters for the graph
    this.config = {
      maxNbNodes: 13,
      bestNEdges: 3,
      minNbSharedEventEdge: 1,
      toneDistThreshold: 1,
    };
  }

  init() {
    const self = this;
    dataManagerInstance.subscribe(this);
    if (typeof this.paramContext !== "undefined") {
      new GraphParamBox(this, this.paramContext, this.config);
    }

    const divZoomBack = document.createElement("div");
    this.mainContext.appendChild(divZoomBack);

    ReactDOM.render(
      <button
        type="button"
        className="btn btn-primary btn-graph-zoom-out"
        onClick={() => self.processAndDisplay()}
      >
        Reset state
      </button>
      , divZoomBack);


    this.cy = cytoscape.use(cola)({
      container: this.mainContext,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            "label": "data(id)",
            "width": "data(scale)",
            "height": "data(scale)",
            "font-size": "data(scale)"
          }
        },
        {
          selector: "edge",
          style: {
            "width": "data(width)",
            "opacity": 0.7,
            "line-color": "data(color)",
            //"target-arrow-color": "#ccc",
            //"target-arrow-shape": "triangle",
            "curve-style": "unbundled-bezier",
            //'control-point-things': xyz
          }
        }
      ],
      layout: {
        name: "grid",
        rows: 1
      }
    });


    this.cy.on("tap", "edge", evt => {
      if (self.viewMode === VIEW_MODE_OVERVIEW) {
        const edge = evt.target;
        const { source, target } = edge.data();
        let source1 = source, source2 = target;

        // check the order
        if (target < source) {
          source1 = target;
          source2 = source;
        }

        self.displayPreciseView(source1, source2);
      }
    });

  }


  updateData(data) {
    this.rawData = data.graph;
    this.processAndDisplay();
  }

  updateConfig(config) {
    this.config = config;
    this.processAndDisplay(this.config);
  }

  processAndDisplay(config = this.config) {
    this.processData(config);
    this.displayGeneralView();
  }

  processData(config) {
    const nodesIds = this.rawData.nodes,
      edgesInfo = this.rawData.edgesData,
      otherInfos = this.rawData.other;

    this.generalElements = Array();

    // const { maxToneDist, maxSharedEventsCount } = otherInfos;
    const { maxSharedEventsCount } = otherInfos;

    // handling nodes
    // Take the top nodes and limit to maxNbNodes
    let nodes = Array.sort(
      Object.entries(nodesIds),
      (a, b) => b[1] - a[1]
    );
    nodes = nodes.slice(0, config.maxNbNodes);

    nodes.forEach(el => {
      this.generalElements.push({
        group: "nodes", data: {
          id: el[0],
          color: NODE_SOURCE_COLOR,
          scale: 10 * el[1] / maxSharedEventsCount
        }
      });
    });

    // Handling edges
    const nodesNames = nodes.map(el => el[0]);
    const edgesMap = edgesToMap(nodesNames, edgesInfo);
    const edgeMemory = new Map();

    nodesNames.forEach(source1 => {
      const possibleEdges = edgesMap.get(source1).slice(0, config.bestNEdges);

      possibleEdges.forEach(edge => {
        const source2 = edge[0];
        const id = buildEdgeId(source1, source2);

        if (!edgeMemory.has(id)) {
          edgeMemory.set(id, true);
          const { eventsSharedCount, meanToneDist } = edge[1];

          if (eventsSharedCount > this.config.minNbSharedEventEdge) {
            this.generalElements.push({
              group: "edges", data: {
                id,
                source: source1,
                target: source2,
                width: Math.exp(1 + 2 * (eventsSharedCount / maxSharedEventsCount)),
                color: meanToneDist > this.config.toneDistThreshold ? "red" : "green",
                dist: meanToneDist,
              }
            });
          }
        }
      });
    });

  }

  displayGeneralView() {
    this.viewMode = VIEW_MODE_OVERVIEW;
    this.updateViz(this.generalElements);
  }

  /**
   * source1 < source2
   *
   * @param {string} source1
   * @param {string} source2
   * @memberof Graph
   */
  displayPreciseView(source1, source2) {
    let elements = Array();

    [source1, source2].forEach(source => {
      elements.push({
        group: "nodes", data: {
          color: NODE_SOURCE_COLOR,
          id: source,
          scale: 1
        }
      });
    });

    const edgesInfo = this.rawData.edgesData;
    const sharedEvents = edgesInfo[source1][source2];
    for (const eventId in sharedEvents) {
      // event node
      elements.push({
        group: "nodes", data: {
          id: eventId,
          color: NODE_EVENT_COLOR,
          scale: 1
        }
      });

      // edges
      [source1, source2].forEach(source => {
        elements.push({
          group: "edges", data: {
            id: `${eventId}%${source}`,
            source: source,
            target: eventId,
            width: 1,
            color: "red",
            dist: 1,
          }
        });
      });

    }
    this.viewMode = VIEW_MODE_DETAILS;
    this.updateViz(elements);
  }


  updateViz(elements) {
    this.cy.elements().remove();
    this.cy.add(elements);

    if (this.viewMode === VIEW_MODE_OVERVIEW) {
      this.cy.layout({
        name: "circle",
        edgeLength: (edge) => edge.dist
        // nodeOverlap: 20,
        // fit: true,
        // randomize: false,
        // componentSpacing: 100,
        // nestingFactor: 5,
        // idealEdgeLength: 100
      }).run();
    } else if (this.viewMode === VIEW_MODE_DETAILS) {
      this.cy.layout({
        name: "cola",
        edgeLength: (edge) => edge.dist
        // nodeOverlap: 20,
        // fit: true,
        // randomize: false,
        // componentSpacing: 100,
        // nestingFactor: 5,
        // idealEdgeLength: 100
      }).run();
    } else {
      throw new Error("Not supported");
    }

  }
}

export default Graph;
