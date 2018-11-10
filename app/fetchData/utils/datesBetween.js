import dateValid from "./dateValid";

/**
 * Generator of dates that have 15 minutes more each time.
 * The first date is the beginDate.
 *
 * @param {Date} beginDate
 */
export function* dateGenerator(beginDate) {
  let date = beginDate;
  yield date;

  while (true) {
    date = new Date(date.getTime() + 15 * 60000);
    yield date;
  }
}


/**
 *  Generates an array of valid dates spaced by 15 minutes.
 *
 * @param {Date} date1 Start date serie, should be valid for fetching Gdelt
 * @param {Date} date2 End date serie, should be valid for fetching Gdelt
 * @returns {Array[Date]}
 */
function datesBetween(date1, date2) {
  if (!dateValid(date1) || !dateValid(date2)) {
    throw new Error("dates are not valid in datesBetween function");
  }

  if (date1 > date2) {
    throw Error("Give dates in order please; lazy programmer");
  }

  let res = Array();
  const generator = dateGenerator(date1);
  let date = generator.next().value;
  while (date <= date2) {
    res.push(date);
    date = generator.next().value;
  }
  return res;
}

export default datesBetween;
