import CONFIG from "../config.js";

/**
 * Function to make a GBQ query through the proxyserver.
 * The full pipeline is returned.
 *
 * @export
 * @param {Object} queryParameters
 * Allowed query parameters are the following:
 * date_begin (string) ex: "2018-11-21T00:00:00.000Z" (should be obtain using date.toJSON())
 * date_end (string) ex: "2018-11-21T00:00:00.000Z" (should be obtain using date.toJSON())
 * minimum_distinct_source_count (int)
 * confidence: int in [0, 100]
 * limit: int (number of elements the google big query shold return)
 * @returns {Promise[object]}
 */
export async function fetchQueryResult(queryParameters) {
  const data = await fetch(CONFIG.END_POINT_LIVE_GDELT_DATA + "query", {
    method: "POST",
    Accept: "application/json",
    body: JSON.stringify(queryParameters)
  });
  return await data.json();
}


/**
 * Function to fetch a specefic dataset
 *
 * @export
 * @param {string} datasetName
 * @returns The data corresponding to the dataset
 */
export async function fetchDataset(datasetName) {
  const data = await fetch(CONFIG.END_POINT_LIVE_GDELT_DATA + "dataset/" + datasetName);
  return await data.json();
}


/**
 * Query the backend to know if Google Big Querry is available form the server.
 *
 * @export
 * @returns
 */
export async function fetchGBQServerStatus() {
  const response = await fetch(CONFIG.END_POINT_LIVE_GDELT_DATA + "is_gbq_active");
  return await response.json();
}


/**
 * Query the backend to know if server is active
 *
 * @export
 * @returns
 */
export async function fetchServerStatus() {
  const response = await fetch(CONFIG.END_POINT_LIVE_GDELT_DATA + "is_server_active");
  return await response.json();
}
