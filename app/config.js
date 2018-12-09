const LIVE_API = "https://gdelt-dataviz-epfl.floflo.ch/";

const todayTimestamp = new Date().getTime();
const yesterday = new Date(todayTimestamp - (3600 * 24 * 1000));

let CONFIG = {
  FIRST_AVAILABLE_GDELT_DATETIME: new Date(Date.UTC(2015, 1, 18, 22, 45, 0, 0)),
  // For simplicity we set the max querrying time to 24 houts earlier
  LAST_AVAILABLE_GDELT_DATETIME: yesterday,
  MAX_NB_HOURS_GBQ_QUERY: 24,
  PRE_FETCHED_DATASETS: ["ex_GBQ_res.json"],
  END_POINT_LIVE_GDELT_DATA: "http://0.0.0.0:8000/",
  //"END_POINT_LIVE_GDELT_DATA": LIVE_API,
  GRAPH_MAX_NB_NODES: 70,
  GRAPH_MAX_NB_BEST_EDGES: 10,
  GRAPH_MAX_TONE_DIST_THRESHOLD: 10,
  GRAPH_MAX_MIN_NB_SHARED_EVENTS_EDGE: 500
};

try {
  const url = window.location.href;
  if (url.includes("github")) {
    CONFIG.END_POINT_LIVE_GDELT_DATA = LIVE_API;
  }
} catch (err) { (err) => err; }  // useless, but linting workd :)

export default CONFIG;
