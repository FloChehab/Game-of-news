import dateFromStrDateTime from "./fetchData/utils/dateFromStrDateTime";

const LIVE_API = "https://gdelt-proxy-epfl-data-viz.herokuapp.com/proxy/gdeltv2/";

let CONFIG = {
  FIRST_FETCHABLE_GDELT_CSV_DATETIME: dateFromStrDateTime("20150218224500"),
  MAX_15_MIN_INTERVALS: 40,
  END_POINT_LIVE_GDELT_DATA: "/data/extracts/",
  //"END_POINT_LIVE_GDELT_DATA": LIVE_API,
  BASE_END_POINT_GDELT_LAST_UPDATE_CSV: "lastupdate-translation.txt",
  EVENTS_CSV_END_NAME: ".translation.export.CSV.zip",
  MENTIONS_CSV_END_NAME: ".translation.mentions.CSV.zip",
  MENTIONS_CSV_FILTER: [
    "eventId",
    "dateEventAdded",
    "mentionDate",
    "mentionType",
    "mentionSourceName",
    "mentionId",
    "confidence",
    "mentionDocTone",
  ],
  EVENTS_CSV_FILTER: [
    "eventId",
    "eventDate",
    "actor1Code",
    "actor1Name",
    "actor1CountryCode",
    "actor2Code",
    "actor2Name",
    "actor2CountryCode",
    "confidence",
    "tone",
  ]
};

try {
  const url = window.location.href;
  if (url.includes("github")) {
    CONFIG.END_POINT_LIVE_GDELT_DATA = LIVE_API;
  }
} catch (err) { (err) => err; }  // useless, but linting workd :)

export default CONFIG;
