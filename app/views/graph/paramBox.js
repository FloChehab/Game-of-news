import { fastSetAttribute } from "../utils/fastSetAttribute";
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
    this.parent = parent;
    this.init(container);
  }

  init(container) {
    const rangeId = `range-${getId()}`;
    let label = document.createElement("label");
    label.innerText = "Number of nodes (best nodes in terms of shared events)";
    fastSetAttribute(label, { for: rangeId });


    let inputNbNodes = document.createElement("input");
    fastSetAttribute(inputNbNodes, {
      type: "range",
      class: "custom-range",
      min: 2,
      max: CONFIG.GRAPH_MAX_NB_NODES,
      step: 1,
      value: this.config.maxNbNodes,
      id: rangeId
    });

    inputNbNodes.onchange = () => {
      this.updateConfig({
        maxNbNodes: inputNbNodes.value
      });
    };

    container.appendChild(label);
    container.appendChild(inputNbNodes);
  }

  updateConfig(config) {
    for (const conf in config) {
      this.config[conf] = config[conf];
    }

    this.parent.updateConfig(this.config);
  }

}

