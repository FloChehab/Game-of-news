/**
 * Compute the correct value to put in the tooltip
 *
 * @export
 * @param {Date} refDate data at which we want the value
 * @param {Array} allData Should be sorted according to mentionInterval
 * @param {String} key
 * @returns
 */
export function getDataHover(refDate, allData, key) {
  const refTime = refDate.getTime();
  let objLeft = allData[0];
  let objRight = allData[0];

  // find points surrounding
  for (const dataPoint of allData) {
    if (dataPoint.mentionInterval.getTime() < refTime) {
      objLeft = objRight;
      objRight = dataPoint;
    } else {
      objLeft = objRight;
      objRight = dataPoint;
      break;
    }
  }

  // Take weigthed mean of the two according to location
  const leftTime = objLeft.mentionInterval.getTime(),
    rightTime = objRight.mentionInterval.getTime();

  if (leftTime === rightTime) {
    return objLeft[key];
  } else {
    const alpha = (refTime - leftTime) / (rightTime - leftTime);
    return (1 - alpha) * objLeft[key] + alpha * objRight[key];
  }
}
