import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
cytoscape.use( popper );
import tippy from "tippy.js";


export function makeTooltip (node,content) {
  return tippy(node.popperRef(), {
    html: (() => {
      let div = document.createElement("div");
      div.innerHTML = content;
      return div;
    })(),
    trigger: "manual",
    arrow: true,
    placement: "bottom",
    hideOnClick: false,
    sticky: true
    }).tooltips[0];
}
