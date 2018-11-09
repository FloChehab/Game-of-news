import dateFromStrDateTime from "../utils/dateFromStrDateTime";
import { parseString, parseBool, compileSchema } from "./utils.js";

// Based on:
// https://bigquery.cloud.google.com/table/gdelt-bq:gdeltv2.eventmentions?tab=schema
const description = [
  { eventId: parseInt },
  { dateEventAdded: dateFromStrDateTime },
  { mentionDate: dateFromStrDateTime },
  { mentionType: parseInt },
  { mentionSourceName: parseString },
  { mentionId: parseString },
  { sentenceId: parseInt },
  { actor1CharOffset: parseInt },
  { actor2CharOffset: parseInt },
  { actionCharOffset: parseInt },
  { inRawText: parseBool },
  { confidence: parseInt },
  { mentionDocLen: parseInt },
  { mentionDocTone: parseFloat },
  { mentionDocTranslationInfo: parseString },
];

const mentionsSchema = compileSchema(description);
export default mentionsSchema;
