import { fastAttribute } from "../utils/fastAttribute";
import CONFIG from "../../config";

// var config = {
//   maxNbNodes: 13,
//   bestNEdges: 3,
// };
function getId() {
  return new Date().getTime();
}

export class GraphParamBox {
  constructor(parent, container, config) {
    this.config = config;
    this.init(container);
  }

  init(container) {
    const rangeId = `range:${getId()}`;
    let label = document.createElement("label");
    fastAttribute(label, { for: rangeId });

    let inputNbNodes = document.createElement("input");
    fastAttribute(inputNbNodes, {
      type: "range",
      class: "custom-range",
      min: 2,
      max: CONFIG.GRAPH_MAX_NB_NODES,
      step: 1,
      value: this.config.maxNbNodes,
      id: rangeId
    });

    inputNbNodes.onchange = () => {
      console.log(inputNbNodes.value);
    };

    container.appendChild(label);
    container.appendChild(inputNbNodes);
  }

}

