/**
 * Function that takes a dict of attributes and set it on the element
 *
 * @export
 * @param {HTMLElement} el
 * @param {Object} attrs
 */
export function fastSetAttribute(el, attrs) {
  for (const attrKey in attrs) {
    el.setAttribute(attrKey, attrs[attrKey]);
  }
}
