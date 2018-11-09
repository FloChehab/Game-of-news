/**
 * Application entry point
 */

// Load application styles
// import 'styles/index.scss';
import fetchMentionsEvents from "./fetchData/fetchMentionsEvents";

// ================================
// START YOUR APP HERE
// ================================

console.log(fetchMentionsEvents(new Date()));
