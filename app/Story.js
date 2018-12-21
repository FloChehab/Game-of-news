import "../assets/styles/story.scss";
import Graph from "./views/graph/Graph";
import StackedGraph from "./views/stackedGraph/StackedGraph";


class Story {
  constructor() {
  }

  init(data) {
    this.graph = new Graph(
      document.getElementById("storyGraph"),
      undefined,
      {
        maxNbNodes: 13,
        bestNEdges: 4,
        minNbSharedEventEdge: 1,
        toneDistThreshold: 1,
        posNegThreshold: 3
      }
    );
    this.graph
      .init(false);

    this.streamgraph = new StackedGraph(document.getElementById("storyStackedGraphContainer"));
    this.streamgraph
      .init(false);

    this.graph.updateData(data);
    this.streamgraph.updateData(data);
  }
}

export default Story;
