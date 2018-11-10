
/**
 * Add zeros to the left of a string
 *
 * @param {String} str
 * @param {number} [len=2] Desirer final len of the string
 * @returns {String}
 */
function addZerosLeft(str, len = 2) {
  return (new Array(len + 1).join("0") + str).slice(-len);
}

/**
 * Function to create a Date object corresponding to a string such as
 *
 * @param {Date} date ex: Wed Feb 18 2015 23:45:00 GMT+0100 (Central European Standard Time)
 * @returns {String} ex: "20150218224500"
 */
function strDateTimeFromDate(date) {
  if (!(date instanceof Date)) {
    throw "Expecting a date in strDateTimeFromDate function";
  }

  const YYYY = date.getUTCFullYear(),
    MM = addZerosLeft(date.getUTCMonth() + 1), // correct month numbering
    DD = addZerosLeft(date.getUTCDate()),
    hh = addZerosLeft(date.getUTCHours()),
    mm = addZerosLeft(date.getUTCMinutes());

  return `${YYYY}${MM}${DD}${hh}${mm}00`;
}

export default strDateTimeFromDate;
