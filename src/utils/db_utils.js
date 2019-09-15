const fs = require("fs");

const writeActiveRsvpToFile = (activeRsvp, filename) => {
  // Convert Maps to maps so they can be stored as JSON string
  if (activeRsvp) {
    if (activeRsvp.coming) {
      activeRsvp.coming = Array.from(activeRsvp.coming.entries());
    }
    if (activeRsvp.notComing) {
      activeRsvp.notComing = Array.from(activeRsvp.notComing.entries());
    }
  }
  writeJsonToFile(activeRsvp, filename);
};

const readActiveRsvpFromFile = filename => {
  const activeRsvp = readJsonFromFile(filename);
  // Deserialise arrays into Map objects
  if (activeRsvp) {
    if (activeRsvp.coming) {
      activeRsvp.coming = new Map(activeRsvp.coming);
    }
    if (activeRsvp.notComing) {
      activeRsvp.notComing = new Map(activeRsvp.notComing);
    }
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
    fs.readFileSync(filename, "utf8", (err, jsonString) => {
      if (err) {
        throw err;
      }
      return JSON.parse(jsonString);
    });
  } catch (err) {
    console.log(`Error reading from ${filename}: ${err}`);
  }
  return null;
};

module.exports = {
  readJsonFromFile,
  writeJsonToFile,
  readActiveRsvpFromFile,
  writeActiveRsvpToFile
};
