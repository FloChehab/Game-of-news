const oneHourInMs = 60 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Function that rounds a date to the nearest hour.
 *
 * @export
 * @param {Date} date Date to round
 * @param {function} roundingMethod What methods is used to round to the nearest hour.
 * @returns {Date} The reounded date.
 */
export function nearestHourDate(date, roundingMethod = Math.round) {
  return new Date(roundingMethod(date.getTime() / oneHourInMs) * oneHourInMs);
}


/**
 * Compute the delay between 2 dates in millisecond.
 *
 * @export
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
export function absDelayBetweenDates(date1, date2) {
  return Math.abs(date1.getTime() - date2.getTime());
}

/**
 *  Compute the number of quarters of hour between date1 and date2
 *
 * @export
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
export function numberOfHoursBetween(date1, date2) {
  return absDelayBetweenDates(date1, date2) / oneHourInMs;
}


/**
 * Checks if two dates are equal
 *
 * @export
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function datesAreEqual(date1, date2) {
  return date1.toString() == date2.toString();
}


/**
 * Convert a date to yyyy-mm-dd format
 *
 * @export
 * @param {Date} date
 * @returns
 */
export function dateToStrIso(date) {
  const mm = String(date.getUTCMonth() + 1);
  const dd = String(date.getUTCDate());
  return `${date.getUTCFullYear()}-${(mm > 9 ? "" : "0") + mm}-${(dd > 9 ? "" : "0") + dd}`;
}

/**
 * Convert yyyy-mm-dd to a date
 *
 * @export
 * @param {string} str
 * @returns {Date}
 */
export function strIsoToDate(str) {
  let [yyyy, mm, dd] = str.split("-").map(v => +v);
  mm -= 1; // correct the date for javascript
  return new Date(yyyy, mm, dd);
}

/**
 * Function that returns a new date with all attributes not related to date set to zero.
 * Date will be centered on UTC time.
 *
 * @export
 * @param {Date} date
 * @returns
 */
export function roundDateTimeToDayUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Function that returns a new date with all attributes not related to date set to zero.
 *
 * @export
 * @param {Date} date
 * @returns
 */
export function roundDateTimeToDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

const nbMsInHour = 60 * 60 * 1000;
/**
 *
 *
 * @export
 * @param {Date} date
 * @param {number} hours
 */
export function addHourToDate(date, hours) {
  return new Date(date.getTime() + hours * nbMsInHour);
}
