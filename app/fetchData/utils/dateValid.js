import CONFIG from "../../config";

/**
 * Function to test that the files from a given date(time)
 * Can be fetch from GDELT server.
 *
 * The maxDate should be specified with the one parsed from
 * letest....txt
 *
 * @param {Date} date date to test
 * @param {Date} [maxDate=null] maxDate to test against
 * @returns {bool} Does the date pass the test
 */
function dateValid(date, maxDate = null) {
  if (date < CONFIG.FIRST_FETCHABLE_GDELT_CSV_DATETIME) {
    return false;
  }

  if (maxDate && date > maxDate) {
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
