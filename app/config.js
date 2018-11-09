import dateFromStrDateTime from "./fetchData/utils/dateFromStrDateTime";


const CONFIG = {
  "MAX_FETCHABLE_GDELT_CSV_DATETIME": dateFromStrDateTime("20150218224500"),
  "END_POINT_LIVE_GDELT_CSV": "https://gdelt-proxy-epfl-data-viz.herokuapp.com/proxy/",
  "BASE_END_POINT_GDELT_LAST_UPDATE_CSV": "gdeltv2/lastupdate.txt"
};

export default CONFIG;
