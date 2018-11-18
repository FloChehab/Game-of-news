import { nearestQuarterDate, numberOfQuartersBetween } from "../utils/dateManipulations";

test("nearest quarter date rounding", () => {
  const d1 = new Date(2018, 10, 2, 12, 10),
    d1Target = new Date(2018, 10, 2, 12, 15),
    d2 = new Date(2018, 10, 2, 12, 20),
    d2Target = new Date(2018, 10, 2, 12, 15),
    d3 = new Date(2018, 10, 2, 12, 30),
    d3Target = new Date(2018, 10, 2, 12, 30);

  expect(nearestQuarterDate(d1).toString()).toBe(d1Target.toString());
  expect(nearestQuarterDate(d2).toString()).toBe(d2Target.toString());
  expect(nearestQuarterDate(d3).toString()).toBe(d3Target.toString());
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
