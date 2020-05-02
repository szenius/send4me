const https = require('https');

const ping = (appUrl) => {
  https.get(appUrl);
};

module.exports = {
  ping,
};
