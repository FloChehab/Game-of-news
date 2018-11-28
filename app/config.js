const LIVE_API = "https://gdelt-proxy-epfl-data-viz.herokuapp.com/";

const todayTimestamp = new Date().getTime();
const yesterday = new Date(todayTimestamp - (3600 * 24 * 1000));

let CONFIG = {
  FIRST_AVAILABLE_GDELT_DATETIME: new Date(Date.UTC(2015, 1, 18, 22, 45, 0, 0)),
  // For simplicity we set the max querrying time to 24 houts earlier
  LAST_AVAILABLE_GDELT_DATETIME: yesterday,
  MAX_NB_HOURS_GBQ_QUERY: 40,
  END_POINT_LIVE_GDELT_DATA: "http://0.0.0.0:8000/",
  //"END_POINT_LIVE_GDELT_DATA": LIVE_API,
};

try {
  const url = window.location.href;
  if (url.includes("github")) {
    CONFIG.END_POINT_LIVE_GDELT_DATA = LIVE_API;
  }
} catch (err) { (err) => err; }  // useless, but linting workd :)

export default CONFIG;
