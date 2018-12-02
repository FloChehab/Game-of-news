import cytoscape from "cytoscape";
// import _ from "lodash";
import dataManagerInstance from "../../fetchData/DataManager";
// import { runInThisContext } from "vm";

class Graph {
  constructor(context) {
    this.context = context;
    this.rawData = Array();
    this.connections = {};
    this.nodes = Array();
    this.edges = Array();
  }

  init() {
    dataManagerInstance.subscribe(this);

    this.cy = cytoscape({
      container: this.context,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#666",
            "label": "data(id)"
          }
        },
        {
          selector: "edge",
          style: {
            "width": 10,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle"
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
    this.processData(graph["mappingIdSource"], graph["data"]);
    this.updateViz();
  }
  // appendData(data) {
  //   this.rawData.push.apply(this.rawData, data);
  // }

  processData(sources, info) {
    // const bySource = _(this.rawData)
    //   .chain()
    //   .groupBy("mentionSourceName")
    //   .value();

    // const byEvent  = _(this.rawData)
    //   .chain()
    //   .groupBy("eventId")
    //   .value();

    // _.forEach(Object.keys(bySource), (lkey) => {
    //   this.connections[lkey] = {};
    // });

    // _.forEach(Object.keys(bySource), (lkey) => {
    //   _.forEach(bySource[lkey],(lmen) => {
    //     const rmentions = _.filter(byEvent[lmen.eventId],e=>e.mentionSourceName > lkey);
    //     _.forEach(rmentions, (rmen) => {
    //       this.connections[lmen.mentionSourceName][rmen.mentionSourceName] =
    //           (this.connections[lmen.mentionSourceName][rmen.mentionSourceName]) || [];
    //       this.connections[rmen.mentionSourceName][lmen.mentionSourceName] =
    //           (this.connections[rmen.mentionSourceName][lmen.mentionSourceName]) || [];

    //       this.connections[lmen.mentionSourceName][rmen.mentionSourceName].push(rmen);
    //       this.connections[rmen.mentionSourceName][lmen.mentionSourceName].push(rmen);
    //     });
    //   });
    // });

    this.nodes = [];
    for (const key in sources) {
      this.nodes.push({ id: key });
    }

    this.edges = [];
    for (const eventId in info) {
      // console.log(this.edges.length)
      if (this.edges.length > 10000) break; // TODO better
      for (const source1 in info[eventId]) {
        if (this.edges.length > 10000) break; // TODO better
        for (const source2 in info[eventId]) {
          if (source1 != source2) {
            this.edges.push({
              id: eventId + source1 + source2,
              source: source1,
              target: source2
            });
          }
        }
      }
    }

    // console.log(this.edges);
    // this.nodes = _(this.connections)
    //   .chain()
    //   .map((neighborhood, node) => ({ id: node }))
    //   .value();

    // this.edges = _(this.connections)
    //   .chain()
    //   .map((neighborhood, node) => {
    //     return _.map(neighborhood, (mentions, name) => {
    //       return ({
    //         id: node + "_" + name,
    //         source: node,
    //         target: name
    //       });
    //     });
    //   })
    //   .flatten()
    //   .value();
  }

  updateViz() {
    this.cy.elements().remove();

    const cy_nodes = this.nodes.map(data => {
      return { group: "nodes", data };
    });

    const cy_edges = this.edges.map(
      data => {
        return { group: "edges", data };
      });

    // const cy_edges = _(this.edges)
    //   .map(e => ({ group: "edges", data: e }))
    //   .value();

    this.cy.add(cy_nodes);
    this.cy.add(cy_edges);

    //console.log(cy_edges);
    //console.log(cy_nodes);

    this.cy.layout({
      name: "concentric",
      nodeOverlap: 20,
      fit: true,
      randomize: false,
      componentSpacing: 100,
      nestingFactor: 5,
      idealEdgeLength: 100
    }).run();
  }
}

export default Graph;
