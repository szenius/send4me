const fs = require("fs");

/**
 * Writes activeRSVP to json file. Attendance maps are serialised as arrays.
 *
 * @param {*} activeRsvp
 * @param {string} filename
 */
const writeActiveRsvpToFile = (activeRsvp, filename) => {
  if (!activeRsvp) {
    writeJsonToFile({}, filename);
  }
  const activeRsvpCopy = {
    ...activeRsvp,
    coming: Array.from(activeRsvp.coming.entries()) || [],
    notComing: Array.from(activeRsvp.notComing.entries()) || []
  };
  writeJsonToFile(activeRsvpCopy, filename);
};

/**
 * Reads activeRsvp from a json file. Dates and attendance maps are deserialised.
 * If the deadline is over, return null. Otherwise, return the read activeRsvp.
 *
 * @param {string} filename
 */
const readActiveRsvpFromFile = filename => {
  const activeRsvp = readJsonFromFile(filename);
  if (activeRsvp) {
    activeRsvp.date = new Date(activeRsvp.date);
    activeRsvp.deadline = new Date(activeRsvp.deadline);

    if (activeRsvp.deadline < new Date()) {
      return null;
    }

    activeRsvp.coming = new Map(activeRsvp.coming) || new Map();
    activeRsvp.notComing = new Map(activeRsvp.notComing) || new Map();
    return activeRsvp;
  }
  return null;
};

/**
 * Writes JSON file to file with given filename.
 *
 * @param {*} object
 * @param {string} filename
 */
const writeJsonToFile = (object, filename) => {
  fs.writeFile(filename, JSON.stringify(object, null, 2), err => {
    if (err) {
      console.log(`Failed to write object to file: ${err}`);
      return;
    }
    console.log(`Wrote object ${JSON.stringify(object)} to file ${filename}`);
  });
};

/**
 * Reads JSON object from file with given filename.
 *
 * @param {string} filename
 */
const readJsonFromFile = filename => {
  try {
    return JSON.parse(fs.readFileSync(filename));
  } catch (err) {
    console.log(`Error reading from ${filename}: ${err}`);
    return null;
  }
};

module.exports = {
  readJsonFromFile,
  writeJsonToFile,
  readActiveRsvpFromFile,
  writeActiveRsvpToFile
};
