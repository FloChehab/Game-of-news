/**
 * https://stackoverflow.com/a/30800715
 * (updaded to prevent bugs when creating big files)
 *
 * @param {Object} exportObj
 * @param {String} exportName
 */
export function downloadObjectAsJson(exportObj, exportName) {
  const blob = new Blob([JSON.stringify(exportObj)], { type: "application/json" });
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", URL.createObjectURL(blob));
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
