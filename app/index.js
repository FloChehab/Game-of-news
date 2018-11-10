/**
 * Application entry point
 */

// Load application styles
// import 'styles/index.scss';
import fetchMentionsEvents from "./fetchData/fetchMentionsEvents";
import CONFIG from "./config";

// ================================
// START YOUR APP HERE
// ================================

fetchMentionsEvents(CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME).then( obj => console.log(obj.data));
