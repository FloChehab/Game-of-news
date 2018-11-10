/**
 * Application entry point
 */

// Load application styles
// import 'styles/index.scss';
// import fetchEventsMentions from "./fetchData/fetchEventsMentions";
import CONFIG from "./config";
import dataManager from "./fetchData/DataManger";

// ================================
// START YOUR APP HERE
// ================================

//fetchEventsMentions(CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME).then( obj => console.log(obj.data));
dataManager.get15MinData(CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME).then( data => console.log(data, dataManager));
