import strDateTimeFromDate from "./utils/strDateTimeFromDate";
import CONFIG from "../config.js";
import eventsSchema from "./schemas/eventsSchema";
import mentionsSchema from "./schemas/mentionsSchema";
import { filterCompiledSchema } from "./schemas/utils";

import JSZip from "jszip";

const filteredMentionsSchema = filterCompiledSchema(mentionsSchema, CONFIG.MENTIONS_CSV_FILTER);
const filteredEventsSchema = filterCompiledSchema(eventsSchema, CONFIG.EVENTS_CSV_FILTER);

async function unzipBlob(blob) {
  try {
    const zipObj = await JSZip.loadAsync(blob);
    const files = zipObj.files;
    const file = files[Object.keys(files)[0]]; // there is only file in each zip
    const txt = await file.async("text");
    return { success: true, data: txt };
  } catch (error) {
    return { success: false, error };
  }
}

async function fetchZip(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return unzipBlob(blob);
  } catch (error) {
    return { success: false, error };
  }
}

function parseRow(row, rowSchema) {
  let res = {};
  for (const key in rowSchema) {
    const keyConfig = rowSchema[key];
    const strVal = row[keyConfig.col];
    res[key] = keyConfig.parser(strVal);
  }
  return res;
}

function parseTSV(txt, rowSchema) {
  return txt.split("\n")
    .map(l => l.split("\t"))
    .map(r => parseRow(r, rowSchema));
}

function parseMentions(txt) {
  return parseTSV(txt, filteredMentionsSchema)
    .filter(r => r.mentionType === 1);
}

function parseEvents(txt) {
  return parseTSV(txt, filteredEventsSchema);
}

function fetchMentionsEvents(date) {
  let d = date;
  if (typeof date !== "string") {
    d = strDateTimeFromDate(date);
  }

  const urlMentions = CONFIG.END_POINT_LIVE_GDELT_DATA + "20181109173000.mentions.CSV.zip";
  fetchZip(urlMentions).then(res => {
    if (res.success) {
      console.log(parseMentions(res.data));
    } else {
      throw new Error();
    }
  });

  const urlEvents = CONFIG.END_POINT_LIVE_GDELT_DATA + "20181109173000.export.CSV.zip";
  fetchZip(urlEvents).then(res => {
    if (res.success) {
      console.log(parseEvents(res.data));
    } else {
      throw new Error();
    }
  });
}

export default fetchMentionsEvents;
