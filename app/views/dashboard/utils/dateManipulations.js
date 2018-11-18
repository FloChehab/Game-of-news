const mins15inMs = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Funtion that rounds a date to the nearest quarter of time.
 *
 * @export
 * @param {Date} date Date to round
 * @param {function} roundingMethod What methods is used to round to the nearest quarter.
 * @returns {Date} The reounded date.
 */
export function nearestQuarterDate(date, roundingMethod = Math.round) {
  return new Date(roundingMethod(date.getTime() / mins15inMs) * mins15inMs);
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
export function numberOfQuartersBetween(date1, date2) {
  return absDelayBetweenDates(date1, date2) / mins15inMs;
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
