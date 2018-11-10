import fetchLastUpdateDateInstance from "../fetchData/FetchLastUpdateDate";
import dateFromStrDateTime from "../fetchData/utils/dateFromStrDateTime";

test("FetchLastUpdateDate parse", () => {
  const data = `
  140798 db1656643ba5a4bed625cabcdb0fa25a http://data.gdeltproject.org/gdeltv2/20181109151500.translation.export.CSV.zip
  285348 7e45b59ba283de0cee1f8c9f4983faa0 http://data.gdeltproject.org/gdeltv2/20181109151500.translation.mentions.CSV.zip
  11008184 425cde878276c69b8c1b299c98698746 http://data.gdeltproject.org/gdeltv2/20181109151500.translation.gkg.csv.zip
  `;
  expect(fetchLastUpdateDateInstance.parse(data).toString()).toBe(dateFromStrDateTime("20181109151500").toString());
});
