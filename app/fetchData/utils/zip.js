import JSZip from "jszip";

/**
 * Unzip a blob. This function will return only the first
 * file in the zip.
 *
 * @param {blob} blob
 * @returns {Promise} {success: bool, data: string, error}
 */
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

/**
 * Fetch the content of zip file.
 *
 * @export
 * @param {string} url url to fetch
 * @returns {Promise} {success: bool, data: string, error}
 */
export async function fetchZip(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return unzipBlob(blob);
  } catch (error) {
    return { success: false, error };
  }
}
