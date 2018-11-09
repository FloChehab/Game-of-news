import strDateTimeFromDate from "../fetchData/utils/strDateTimeFromDate.js";
import dateFromStrDateTime from "../fetchData/utils/dateFromStrDateTime.js";

const str = "20150218224500";

test("StrDateTime to Date", () => {
  const d = new Date(Date.UTC(2015, 2-1, 18, 22, 45));
  expect(dateFromStrDateTime(str).toString()).toBe(d.toString());
});

test("Date conversion ok", () => {
  expect(strDateTimeFromDate(dateFromStrDateTime(str))).toBe(str);
});
