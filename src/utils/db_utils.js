const fs = require("fs");

const writeActiveRsvpToFile = (activeRsvp, filename) => {
  if (activeRsvp) {
    activeRsvp.coming = Array.from(activeRsvp.coming.entries()) || [];
    activeRsvp.notComing = Array.from(activeRsvp.notComing.entries()) || [];
  }
  writeJsonToFile(activeRsvp, filename);
};

const readActiveRsvpFromFile = filename => {
  const activeRsvp = readJsonFromFile(filename);
  if (activeRsvp) {
    // Deserialise arrays into Map objects
    activeRsvp.coming = new Map(activeRsvp.coming) || new Map();
    activeRsvp.notComing = new Map(activeRsvp.notComing) || new Map();
    // Deserialise date strings into Date objects
    activeRsvp.date = new Date(activeRsvp.date);
    activeRsvp.deadline = new Date(activeRsvp.deadline);
  }
  return activeRsvp;
};

const writeJsonToFile = (object, filename) => {
  fs.writeFile(filename, JSON.stringify(object, null, 2), err => {
    if (err) {
      console.log(`Failed to write object to file: ${err}`);
      return;
    }
    console.log(`Wrote object ${JSON.stringify(object)} to file ${filename}`);
  });
};

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
