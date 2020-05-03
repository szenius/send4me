const {getNewMessages} = require('./database');
const {sendMessage, sendPoll} = require('./bot');

const sendNewMessages = async () => {
  try {
    const [rows] = await getNewMessages();
    console.log(`Found ${rows.length} new messages to be sent`);
    if (rows) {
      rows.forEach((message) => {
        if (message.is_poll) {
          sendPoll(message);
        } else {
          sendMessage(message);
        }
      });
    }
  } catch (err) {
    console.error('Error sending new messages: ', err);
  }
};

const closeOldMessages = () => {
  // TODO:
};

module.exports = {
  sendNewMessages,
  closeOldMessages,
};
