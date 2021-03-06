const LIVE_API = "https://gdelt-dataviz-epfl.floflo.ch/";

const todayTimestamp = new Date().getTime();
const twoDaysBefore = new Date(todayTimestamp - (2 * 3600 * 24 * 1000));

let CONFIG = {
  FIRST_AVAILABLE_GDELT_DATETIME: new Date(Date.UTC(2015, 1, 18, 22, 45, 0, 0)),
  // For simplicity we set the max querrying time to 24 houts earlier
  LAST_AVAILABLE_GDELT_DATETIME: twoDaysBefore,
  MAX_NB_HOURS_GBQ_QUERY: 24,
  PRE_FETCHED_DATASETS: [
    "gilet_jaune_10th_December_->_11th_December.json",
    "gilet_jaune_30th_November_->_2nd_December.json",
    "gilet_jaune_7th_December_->_8th_December.json",
    "Donald_Trump_election_8th_November_2016_->_9th_November_2016.json",
    "Khashoggi_case_20th_October_2018_->_21th_October_2018.json"
  ],
  END_POINT_LIVE_GDELT_DATA: "http://0.0.0.0:8000/",
  //"END_POINT_LIVE_GDELT_DATA": LIVE_API,
  GRAPH_MAX_NB_NODES: 40,
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
