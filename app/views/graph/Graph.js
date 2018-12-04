import cytoscape from "cytoscape";
import cola from "cytoscape-cola";

// import _ from "lodash";
import dataManagerInstance from "../../fetchData/DataManager";
// import { runInThisContext } from "vm";


/**
 * Function that generate a map, with for each node you have a list of
 * [nodeConnected, {meanToneDist, eventsSharedCount}]
 *
 * @param {Array[string]} nodes
 * @param {Object} edgesInfo
 * @returns {Map}
 */
function edgesToMap(nodes, edgesInfo) {
  // Convert nodes to map for better performances
  let nodesMap = new Map();
  nodes.forEach(name => {
    nodesMap.set(name, true);
  });

  // Create the edgesMap and initialize it
  let edgesMap = new Map();
  nodes.forEach(name => {
    edgesMap.set(name, Array());
  });

  // Function to add 2 possible edges to edgesMap
  function addEdges(node1, node2, meanToneDist, eventsSharedCount) {
    // we do it for both nodes
    let cur1 = edgesMap.get(node1);
    cur1.push([node2, { meanToneDist, eventsSharedCount }]);
    edgesMap.set(node1, cur1);

    let cur2 = edgesMap.get(node2);
    cur2.push([node1, { meanToneDist, eventsSharedCount }]);
    edgesMap.set(node2, cur2);
  }

  // Iterate through the data to build the info we need
  for (const source1 in edgesInfo) {
    if (nodesMap.has(source1)) {
      for (const source2 in edgesInfo[source1]) {
        if (nodesMap.has(source2)) {
          // here we can work
          const { meanToneDist, eventsSharedCount } = edgesInfo[source1][source2];
          addEdges(source1, source2, meanToneDist, eventsSharedCount);
        }
      }
    }
  }

  // finally we sort all possible edges for each nodes
  nodes.forEach(source => {
    let cur = edgesMap.get(source);
    edgesMap.set(source, Array.sort(
      cur,
      (a, b) => b[1].eventsSharedCount - a[1].eventsSharedCount
    ));
  });

  return edgesMap;
}



class Graph {
  constructor(context) {

    this.context = context;
    this.rawData = Array();
    this.connections = {};
    this.elements = Array();

    // Parameters for the graph
    this.config = {
      MAX_NODE: 13, // max = 100 !
      BEST_N_EDGES: 3,
    };
  }

  init() {
    dataManagerInstance.subscribe(this);

    this.cy = cytoscape.use(cola)({
      container: this.context,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
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
  }


  updateData(data) {
    const { graph } = data;
    this.processData(graph.nodes, graph.edgesData, graph.other);
    this.updateViz();
  }


  processData(nodesIds, edgesInfo, otherInfos) {
    this.elements = Array();

    // const { maxToneDist, maxSharedEventsCount } = otherInfos;
    const { maxSharedEventsCount } = otherInfos;

    // handling nodes
    // Take the top nodes and limit to MAX_NODE
    let nodes = Array.sort(
      Object.entries(nodesIds),
      (a, b) => b[1] - a[1]
    );
    nodes = nodes.slice(0, this.config.MAX_NODE);

    nodes.forEach(el => {
      this.elements.push({
        group: "nodes", data: {
          id: el[0],
          scale: 10 * el[1] / maxSharedEventsCount
        }
      });
    });

    // Handling edges
    function buildId(source1, source2) {
      let s1 = source1, s2 = source2;
      if (source1 > source2){
        s1 = source2, s2 = source1;
      }
      return `edge:%${s1}%${s2}`;
    }

    const nodesNames = nodes.map(el => el[0]);
    const edgesMap = edgesToMap(nodesNames, edgesInfo);
    const edgeMemory = new Map();

    nodesNames.forEach(source1 => {
      const possibleEdges = edgesMap.get(source1).slice(0, this.config.BEST_N_EDGES);

      possibleEdges.forEach(edge => {
        const source2 = edge[0];
        const id = buildId(source1, source2);

        if (!edgeMemory.has(id)) {
          edgeMemory.set(id, true);
          const { eventsSharedCount, meanToneDist } = edge[1];

          this.elements.push({
            group: "edges", data: {
              id,
              source: source1,
              target: source2,
              width: Math.exp(1 + 2 * (eventsSharedCount / maxSharedEventsCount)),
              color: meanToneDist > 1 ? "red" : "green",
              dist: meanToneDist,
            }
          });
        }
      });
    });

  }

  updateViz() {
    this.cy.elements().remove();
    this.cy.add(this.elements);

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
  }
}

export default Graph;
