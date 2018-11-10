/**
 * Function to create a Date object corresponding to a string such as
 *
 * @param {String} str ex: "20150218224500"
 * @returns {Date} ex: Wed Feb 18 2015 23:45:00 GMT+0100 (Central European Standard Time)
 */
function dateFromStrDateTime(str) {
  const regExpDateDetail = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
  const matches = regExpDateDetail.exec(str);
  if (matches) {
    let dateDetails = matches.slice(1, 7);
    dateDetails[1] -= 1;  // correct month for Date function, damn JS
    return new Date(Date.UTC(...dateDetails)); // date supposed to be in UTC
  } else {
    return null;
  }
}

export default dateFromStrDateTime;
