import dateFromStrDateTime from "./fetchData/utils/dateFromStrDateTime";

const CONFIG = {
  MAX_FETCHABLE_GDELT_CSV_DATETIME: dateFromStrDateTime("20150218224500"),
  END_POINT_LIVE_GDELT_DATA: "/tmp/",
  //"END_POINT_LIVE_GDELT_DATA": "https://gdelt-proxy-epfl-data-viz.herokuapp.com/proxy/gdeltv2/",
  BASE_END_POINT_GDELT_LAST_UPDATE_CSV: "lastupdate.txt",
  EVENTS_CSV_END_NAME: ".export.CSV.zip",
  MENTIONS_CSV_END_NAME: ".mentions.CSV.zip",
  // More info there: https://bigquery.cloud.google.com/table/gdelt-bq:gdeltv2.eventmentions?tab=schema
  // column number for the relevant fields
  MENTIONS_CSV_SCHEMA: {
    eventId: { row: 0, parse: parseInt },
    eventFirstDate: { row: 1, parse: dateFromStrDateTime },
    mentionDate: { row: 2, parse: dateFromStrDateTime },
    mentionType: { row: 3, parse: parseInt },
    mentionSourceName: { row: 4, parse: (str) => str },
    documentId: { row: 5, parse: (str) => str },
    confidence: { row: 11, parse: parseInt },
    tone: { row: 13, parse: parseFloat }
  }
};

export default CONFIG;
