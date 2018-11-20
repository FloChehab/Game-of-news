import {
  nearestQuarterDate,
  numberOfQuartersBetween,
  addHourToDate,
  roundDateTimeToDay
} from "../utils/dateManipulations";


/**
 * Helper function to test if two dates are equal
 *
 * @param {Date} date1
 * @param {Date} date2
 */
function expectDateEquals(date1, date2) {
  expect(date1.toString()).toBe(date2.toString());
}

test("nearest quarter date rounding", () => {
  const d1 = new Date(2018, 10, 2, 12, 10),
    d1Target = new Date(2018, 10, 2, 12, 15),
    d2 = new Date(2018, 10, 2, 12, 20),
    d2Target = new Date(2018, 10, 2, 12, 15),
    d3 = new Date(2018, 10, 2, 12, 30),
    d3Target = new Date(2018, 10, 2, 12, 30);

  expectDateEquals(nearestQuarterDate(d1), d1Target);
  expectDateEquals(nearestQuarterDate(d2), d2Target);
  expectDateEquals(nearestQuarterDate(d3), d3Target);
});


test("number of quarters between dates", () => {
  const d1 = new Date(2018, 10, 2, 12, 15),
    d2 = new Date(2018, 10, 2, 12, 15),
    d3 = new Date(2018, 10, 2, 12, 30),
    d4 = new Date(2018, 10, 2, 12, 45);

  expect(numberOfQuartersBetween(d1, d2)).toBe(0);
  expect(numberOfQuartersBetween(d1, d3)).toBe(1);
  expect(numberOfQuartersBetween(d1, d4)).toBe(2);
  expect(numberOfQuartersBetween(d4, d1)).toBe(2);
});

test("Round datetime to date", () => {
  const d1 = new Date(2018, 10, 2, 12, 15),
    d1Target = new Date(Date.UTC(2018, 10, 2, 0, 0, 0, 0, 0));

  expectDateEquals(roundDateTimeToDay(d1), d1Target);
});


test("add hour to date", () => {
  const d1 = new Date(2018, 10, 2, 12, 0, 0, 0),
    d1Target1 = new Date(2018, 10, 2, 10, 0, 0, 0),
    d1Target2 = new Date(2018, 10, 2, 20, 0, 0, 0);

  expectDateEquals(addHourToDate(d1, -2), d1Target1);
  expectDateEquals(addHourToDate(d1, 8), d1Target2);
});
