import strDateTimeFromDate from "./utils/strDateTimeFromDate";
import CONFIG from "../config.js";
import eventsSchema from "./schemas/eventsSchema";
import mentionsSchema from "./schemas/mentionsSchema";
import { filterCompiledSchema } from "./schemas/utils";
import { fetchZip } from "./utils/zip";
import TSVParser from "./utils/tsv";
import dateValid from "./utils/dateValid";

const filteredMentionsSchema = filterCompiledSchema(mentionsSchema, CONFIG.MENTIONS_CSV_FILTER);
const filteredEventsSchema = filterCompiledSchema(eventsSchema, CONFIG.EVENTS_CSV_FILTER);

const mentionsParser = new TSVParser(filteredMentionsSchema, (r) => r.mentionType === 1);
const eventsParser = new TSVParser(filteredEventsSchema);


/**
 * Fetches a ziped tsv file and parse it
 *
 * @param {string} url url to fetch
 * @param {TSVParser} tsvParser TSVparser to use for parsing the file
 * @returns {Object{ success: bool, data: Array[Object]}} Parsed data if successful
 */
async function fetchAndParseTSV(url, tsvParser) {
  const tsvFile = await fetchZip(url);
  if (tsvFile.success) {
    return { success: true, data: tsvParser.parse(tsvFile.data) };
  } else {
    return tsvFile;
  }
}

/**
 * Fetches and parse the mentions file corresponding the date
 *
 * @param {Date} date
 * @returns {Object{ success: bool, data: Array[Object]}} Parsed data if successful
 */
async function fetchMentions(date) {
  const urlMentions = CONFIG.END_POINT_LIVE_GDELT_DATA + strDateTimeFromDate(date) + CONFIG.MENTIONS_CSV_END_NAME;
  return fetchAndParseTSV(urlMentions, mentionsParser);
}


/**
 * Fetches and parse the events file corresponding the date
 *
 * @param {Date} date
 * @returns {Object{ success: bool, data: Array[Object]}} Parsed data if successful
 */
async function fetchEvents(date) {
  const urlEvents = CONFIG.END_POINT_LIVE_GDELT_DATA + strDateTimeFromDate(date) + CONFIG.EVENTS_CSV_END_NAME;
  return fetchAndParseTSV(urlEvents, eventsParser);
}


/**
 * Merge the two tables of events and mentions
 *
 * @param {Array[Object]} events Array of events
 * @param {Array[Object]} mentions Array of mentions
 * @param {string} join Type of join. "leftJoinMentions" or "innerJoin"
 * @returns {Array[Object]} Result of the merge: for each mention, the event information is added to the field event.
 */
function mergeEventsMentions(events, mentions, join) {
  // optimization
  const eventsMap = new Map(events.map(info => [info.eventId, info]));
  const data = mentions.map(info => {
    let mergedInfo = Object.assign({}, info);
    mergedInfo.event = eventsMap.get(info.eventId);
    return mergedInfo;
  });
  if (join === "leftJoinMentions") {
    return data;
  } else if (join === "innerJoin") {
    return data.filter(mention => mention.event);
  } else {
    throw new Error("Join option not supported in mergeEventsMentions");
  }
}

/**
 * Given a date, this function returns a Promise with the result of fetching
 * the mentions and events table at a given date, and making the merge of the two.
 *
 * @param {*} date
 * @param {string} [join="leftJoinMentions"] Type of join. "leftJoinMentions" or "innerJoin"
 * @returns {Promise({date: Date, success: bool, data: Array[Obj] [, errors: errors]})}
 */
async function fetchEventsMentions(date, join = "leftJoinMentions") {
  if (!dateValid(date)) {
    throw new Error("Date is not valid in fetchMentionsEvents!");
  }
  return Promise.all([fetchEvents(date), fetchMentions(date)])
    .then(fetchedData => {
      const [events, mentions] = fetchedData;
      if (mentions.success && events.success) {
        const data = mergeEventsMentions(events.data, mentions.data, join);
        return { success: true, data, date };
      } else {
        return {
          success: false,
          errors: { mentions: mentions.error, events: events.error },
          date
        };
      }
    });
}

export default fetchEventsMentions;
