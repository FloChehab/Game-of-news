import strDateTimeFromDate from "./utils/strDateTimeFromDate";
import CONFIG from "../config.js";
import JSZip from "jszip";

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

function parseRow(row) {
  let res = {};
  const mentionsSchema = CONFIG.MENTIONS_CSV_SCHEMA;
  for (const key in mentionsSchema) {
    const keyConfig = mentionsSchema[key];
    const strVal = row[keyConfig.row];
    res[key] = keyConfig.parse(strVal);
  }
  return res;
}

function parseMentions(txt) {
  const rows = txt.split("\n")
    .map(l => l.split("\t"))
    .map(r => parseRow(r))
    .filter(r => r.mentionType === 1);
  console.log(rows.slice(0, 3));
}

function fetchMentionsEvents(date) {
  let d = date;
  if (typeof date !== "string") {
    d = strDateTimeFromDate(date);
  }

  const url = CONFIG.END_POINT_LIVE_GDELT_DATA + "20181109173000.mentions.CSV.zip";
  fetchZip(url).then(res => {
    if (res.success) {
      parseMentions(res.data);
    } else {
      throw new Error();
    }
  });
}

export default fetchMentionsEvents;
