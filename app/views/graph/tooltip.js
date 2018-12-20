import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
cytoscape.use( popper );
import tippy from "tippy.js";
import "tippy.js/dist/themes/light.css";

/**
 * Create tooltip box for specified node with given input HTML content.
 *
 * @param node
 * @param content
 * @param placement
 * @returns {tippy}
 */
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

/**
 * Hide tooltip for a given node
 *
 * @param node
 */
export function hideTooltip (node) {
  const tippy = node.data("tippy");
  if (tippy != null)
    tippy.hide();
}

/**
 * Hide tooltip for every node of graph
 *
 * @param cy
 */
export function hideAllTooltips(cy) {
  cy.nodes().forEach(hideTooltip);
}
