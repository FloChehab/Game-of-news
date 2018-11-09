import dateFromStrDateTime from "../utils/dateFromStrDateTime";
import { parseString, parseBool, compileSchema } from "./utils.js";

// Based on:
// https://bigquery.cloud.google.com/table/gdelt-bq:gdeltv2.events
const description = [
  { eventId: parseInt },
  { eventDate: dateFromStrDateTime },
  { monthYear: parseInt },
  { year: parseInt },
  { fractionDate: parseFloat },
  { actor1Code: parseString },
  { actor1Name: parseString },
  { actor1CountryCode: parseString },
  { actor1KnownGroupCode: parseString },
  { actor1EthnicCode: parseString },
  { actor1Religion1Code: parseString },
  { actor1Religion2Code: parseString },
  { actor1Type1Code: parseString },
  { actor1Type2Code: parseString },
  { actor1Type3Code: parseString },
  { actor2Code: parseString },
  { actor1Name: parseString },
  { actor2CountryCode: parseString },
  { actor2KnownGroupCode: parseString },
  { actor2EthnicCode: parseString },
  { actor2Religion1Code: parseString },
  { actor2Religion2Code: parseString },
  { actor2Type1Code: parseString },
  { actor2Type2Code: parseString },
  { actor2Type3Code: parseString },
  { isRootEvent: parseBool },
  { eventCode: parseString },
  { eventBaseCode: parseString },
  { eventRootCode: parseString },
  { QuadClass: parseInt },
  { goldsteinScale: parseFloat },
  { numMentions: parseInt },
  { numSources: parseInt },
  { numArticles: parseInt },
  { avgTone: parseFloat },
  { actor1GeoType: parseInt },
  { actor1GeoFullName: parseString },
  { actor1GeoCrountryCode: parseString },
  { actor1GeoADM1Code: parseString },
  { actor1GeoADM2Code: parseString },
  { actor1GeoLat: parseFloat },
  { actor1GeoLong: parseFloat },
  { actor1GeoFeatureID: parseString },
  { actor2GeoType: parseInt },
  { actor2GeoFullName: parseString },
  { actor2GeoCrountryCode: parseString },
  { actor2GeoADM1Code: parseString },
  { actor2GeoADM2Code: parseString },
  { actor2GeoLat: parseFloat },
  { actor2GeoLong: parseFloat },
  { actor2GeoFeatureID: parseString },
  { actionGeoType: parseInt },
  { actionGeoFullName: parseString },
  { actionGeoCountryCode: parseString },
  { actionGeoADM1Code: parseString },
  { actionGeoADM2Code: parseString },
  { actionGeoLat: parseFloat },
  { actionGeoLon: parseFloat },
  { actionGeoFeatureId: parseString },
  { dateEventAdded: dateFromStrDateTime },
  { sourceURL: parseString }
];

const eventsSchema = compileSchema(description);
export default eventsSchema;