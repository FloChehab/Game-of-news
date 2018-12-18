import React from "react";
import ReactDOM from "react-dom";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import dataManagerInstance from "../../fetchData/DataManager";
import { buildEdgeId } from "./Ids";
import "../../../assets/styles/Graph.scss";
import { edgesToMap } from "./edgesToMap";
import { GraphParamBox } from "./paramBox";
import { hideAllTooltips, hideTooltip, makeTooltip } from "./tooltip";

cytoscape.use(coseBilkent);

const VIEW_MODE_OVERVIEW = 0;
const VIEW_MODE_DETAILS = 1;

const NODE_SOURCE_COLOR = "#495149";
const NODE_EVENT_COLOR = "orange";


class Graph {
  constructor(mainContext, paramContext) {

    this.mainContext = mainContext;
    this.paramContext = paramContext;
    this.rawData = Object();
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


    this.cy = cytoscape({
      container: this.mainContext,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            "label": "data(label)",
            "text-valign": "center",
            "width": "data(scale)",
            "height": "data(scale)",
            "font-size": "data(scale)",
            "font-family": "Special Elite",
            "color": "white",
            "text-outline-width": 2,
            "text-outline-color": "data(color)",
          }
        },
        {
          selector: "edge",
          style: {
            "width": "data(width)",
            "opacity": 0.8,
            "line-color": "data(color)",
            "curve-style": "unbundled-bezier",
            "control-point-distances": "-5",
            "control-point-weights": "0.25 0.75"
          }
        },
        {
          selector: "node.hidden",
          style: { "opacity": "0.2" }
        },
        {
          selector: "node.highlighted",
          style: {
            "background-color": "#e65d3e",
            "text-outline-color": "#e65d3e"
          }
        },
        {
          selector: "edge.highlighted",
          style: {
            "width": Math.exp(3) / 5,
            "opacity": "1"
          }
        },
        {
          selector: "edge.hidden",
          style: { "opacity": "0.2" }
        },
      ],
      layout: {
        name: "grid",
        rows: 1
      },
      wheelSensitivity: 0.2
    });

    this.cy.on("resize", () => {
      this.cy.fit();
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

        hideAllTooltips(this.cy);
        self.displayPreciseView(source1, source2);
      }
    });

    this.cy.on("mouseover", "node", e => {
      if (self.viewMode === VIEW_MODE_OVERVIEW ||
        (self.viewMode === VIEW_MODE_DETAILS && e.target.data("type") === "event")) {
        const sel = e.target;
        this.cy.elements().difference(sel.outgoers().union(sel.incomers())).not(sel).addClass("hidden");
      }
    });
    this.cy.on("mouseover", "edge", e => {
      if (self.viewMode === VIEW_MODE_OVERVIEW) {
        const sel = e.target;
        sel.connectedNodes().union(sel).addClass("highlighted");
      }
    });
    this.cy.on("mouseout", "node", () => {
      this.cy.elements().removeClass("hidden");
    });
    this.cy.on("mouseout", "edge", () => {
      if (self.viewMode === VIEW_MODE_OVERVIEW) {
        this.cy.elements().removeClass("highlighted");
      }
    });

    this.cy.on("tap", e => {
      if (e.target === this.cy) {
        hideAllTooltips(this.cy);
      }
    });

    this.cy.on("tap", "edge", () => {
      hideAllTooltips(this.cy);
    });

    this.cy.on("zoom pan", () => {
      hideAllTooltips(this.cy);
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
          label: el[0].split(".")[0],
          color: NODE_SOURCE_COLOR,
          scale: 8 * el[1] / maxSharedEventsCount,
          sharedEventsCount: el[1],
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
                width: Math.exp(1 + 2 * (eventsSharedCount / maxSharedEventsCount)) / 6,
                color: meanToneDist > this.config.toneDistThreshold ? "  #a20417" : " #007144",
                dist: meanToneDist,
              }
            });
          }
        }
      });
    });

  }

  displayGeneralView() {
    hideAllTooltips(this.cy);
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
    const source1_node = Object.entries(this.rawData.nodes).find(e => {
      return e[0] === source1;
    });
    const source2_node = Object.entries(this.rawData.nodes).find(e => {
      return e[0] === source2;
    });
    let elements = Array();

    [[source1_node, 0], [source2_node, 200]].forEach((node) => {
      elements.push({
        group: "nodes", data: {
          color: NODE_SOURCE_COLOR,
          id: node[0][0],
          scale: 8,
          label: node[0][0].split(".")[0],
          sharedEventsCount: node[0][1],
          type: "source"
        },
        position: { x: node[1], y: 50 }
      });
    });

    const edgesInfo = this.rawData.edgesData;
    const sharedEvents = edgesInfo[source1][source2];

    const eventsNum = Object.keys(sharedEvents).length;
    const step = 100 / eventsNum;
    const pos_y = Array.apply(null, Array(eventsNum)).map(function (_, i) { return i * step; });

    for (const eventId in sharedEvents) {
      const idx = Object.keys(sharedEvents).indexOf(eventId);
      // event node
      elements.push({
        group: "nodes", data: {
          id: eventId,
          color: NODE_EVENT_COLOR,
          scale: 2,
          type: "event"
        },
        position: { x: 100, y: pos_y[idx] }
      });

      // edges
      [source1, source2].forEach(source => {
        elements.push({
          group: "edges", data: {
            id: `${eventId}%${source}`,
            source: source,
            target: eventId,
            width: 0.3,
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
      this.cy.nodes().forEach(node => {
        const content = [
          `<h3>${node.id()}</h3>`,
          "<hr>",
          "<ul>",
          "<h5>",
          `<li><span class="badge badge-secondary">${node.data("sharedEventsCount")}</span>shared events</li>`,
          `<li><span class="badge badge-secondary">${node.degree()}</span>common outlets</li>`,
          "</ul>",
          "</h5>",
        ].join("\n");

        const tippy = makeTooltip(node, content, "bottom");
        node.data("tippy", tippy);
        node.on("tap", () => {
          tippy.show();
          this.cy.nodes().not(node).forEach(hideTooltip);
        });
      });
    } else {
      this.cy.nodes().filter("[type = 'event']").forEach(node => {
        const content = [
          "<h3>Articles:</h3>",
          "<ul>",
          "<li>Link 1</li>",
          "<li>Link 2</li>",
          "</ul>"
        ].join("\n");

        const tippy = makeTooltip(node, content, "right");
        node.data("tippy", tippy);
        node.on("tap", () => {
          tippy.show();
          this.cy.nodes().not(node).forEach(hideTooltip);
        });
      });
    }


    if (this.viewMode === VIEW_MODE_OVERVIEW) {
      this.cy.layout({
        name: "cose-bilkent",
        nodeRepulsion: 5000,
        idealEdgeLength: 60,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.1,
        numIter: 5000,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 4.0,
        initialEnergyOnIncremental: 0.5,
        tile: true
      }).run();
    } else if (this.viewMode === VIEW_MODE_DETAILS) {
      this.cy.layout({
        name: "preset"
      }).run();
    } else {
      throw new Error("Not supported");
    }
  }
}

export default Graph;
