import strDateTimeFromDate from "../fetchData/utils/strDateTimeFromDate.js";
import dateFromStrDateTime from "../fetchData/utils/dateFromStrDateTime.js";
import datesBetween from "../fetchData/utils/datesBetween";

const str = "20150218224500";

test("StrDateTime to Date", () => {
  const d = new Date(Date.UTC(2015, 2 - 1, 18, 22, 45));
  expect(dateFromStrDateTime(str).toString()).toBe(d.toString());
});

test("Date conversion ok", () => {
  expect(strDateTimeFromDate(dateFromStrDateTime(str))).toBe(str);
});

test("datesBetween length", () => {
  const d1 = dateFromStrDateTime("20150218224500");
  const d2 = dateFromStrDateTime("20150218231500");
  expect(datesBetween(d1, d2).length).toBe(3);
});
