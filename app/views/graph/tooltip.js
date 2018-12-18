import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
cytoscape.use( popper );
import tippy from "tippy.js";
import "tippy.js/dist/themes/light.css";


export function makeTooltip (node,content,placement) {
  return tippy(node.popperRef(), {
    html: (() => {
      let div = document.createElement("div");
      div.innerHTML = content;
      return div;
    })(),
    trigger: "manual",
    placement: placement,
    hideOnClick: false,
    interactive: true,
    theme: "light",
    size: "large",
    interactiveBorder: 20,
    distance: 15
  }).tooltips[0];
}

export function hideTooltip (node) {
  const tippy = node.data("tippy");
  if (tippy != null)
    tippy.hide();
}

export function hideAllTooltips(cy) {
  cy.nodes().forEach(hideTooltip);
}
