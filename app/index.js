/**
 * Application entry point
 */

import appInstance from "./App";

// ================================
// START of the app
// ================================

function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    action();
  }
}

whenDocumentLoaded(() => appInstance.init());
