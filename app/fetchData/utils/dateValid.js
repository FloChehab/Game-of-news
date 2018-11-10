import CONFIG from "../../config";
import fetchLastUpdateDateInstance from "../FetchLastUpdateDate";


/**
 * Function to test that the files from a given date(time)
 * Can be fetch from GDELT server.
 *
 * @param {Date} date date to test
 * @returns {bool} Does the date pass the test
 */
function dateValid(date) {
  if (date < CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME) {
    return false;
  }

  const maxDate = fetchLastUpdateDateInstance.get();

  if (maxDate !== false && date > maxDate) {
    return false;
  }

  const mm = date.getUTCMinutes(),
    ss = date.getUTCSeconds();
  if (ss !== 0) {
    return false;
  }
  if (mm === 0 || mm === 15 || mm === 30 || mm === 45) {
    return true;
  } else {
    return false;
  }
}

export default dateValid;
