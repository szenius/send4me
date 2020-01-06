const moment = require("moment");
const { getConnection } = require("./mysql");

const getNewMessages = callback => {
  const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  const query = `SELECT * FROM messages WHERE send_date < '${now}' AND close_date > '${now}' AND is_sent = false`;
  getConnection().query(query, (err, result) => {
    callback(err, result);
  });
};

const getPollResponses = (messageId, chatId, callback) => {
  const query = `SELECT o.text, o.option_id, u.username FROM (options o LEFT JOIN responses r ON o.option_id = r.option_id) LEFT JOIN users u ON r.user_id = u.user_id WHERE o.message_id = ${messageId} AND o.chat_id = ${chatId} ORDER BY o.option_id ASC`;
  getConnection().query(query, (err, result) => {
    callback(err, result);
  });
};

const getMessageById = (messageId, chatId, callback) => {
  const query = `SELECT * FROM messages WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  getConnection().query(query, (err, result) => {
    callback(err, result[0]);
  });
};

const upsertMessage = (message, newMessageId) => {
  const query = `UPDATE messages SET message_id = '${newMessageId}', content = '${
    message.content
  }', send_date = '${moment(message.send_date).format(
    "YYYY-MM-DD HH:mm:ss"
  )}', close_date = '${moment(message.close_date).format(
    "YYYY-MM-DD HH:mm:ss"
  )}', is_poll = ${message.is_poll}, is_sent = ${
    message.is_sent
  }, is_closed = ${message.is_closed}, chat_id = '${
    message.chat_id
  }' WHERE message_id = '${message.message_id}' AND chat_id = '${
    message.chat_id
  }'`;
  getConnection().query(query, err => {
    if (err) console.error("Error upserting message: ", err);
  });
};

const toggleResponse = (userId, optionId, messageId, callback) => {
  const query = `SELECT * FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  getConnection().query(query, (err, result) => {
    if (err) console.error("Error finding response to toggle: ", err);
    if (result.length === 1) {
      deleteResponse(userId, optionId);
      callback(false);
    } else {
      insertResponse(userId, optionId, messageId);
      callback(true);
    }
  });
};

const deleteResponse = (userId, optionId) => {
  const query = `DELETE FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  getConnection().query(query, err => {
    if (err) console.error("Error deleting response: ", err);
  });
};

const insertResponse = (userId, optionId, messageId) => {
  const getOptionsForMessageQuery = `SELECT o.option_id FROM messages m LEFT JOIN options o ON m.message_id = o.message_id WHERE m.message_id = '${messageId}'`;
  getConnection().query(getOptionsForMessageQuery, (err, result) => {
    if (err) console.error("Error getting options for message: ", err);
    result.forEach(optionToDelete => {
      const deleteOtherResponsesQuery = `DELETE FROM responses WHERE option_id = ${optionToDelete.option_id} AND user_id = '${userId}'`;
      getConnection().query(deleteOtherResponsesQuery, err => {
        if (err) console.error("Error deleting response: ", err);
      });
    });
    const insertResponseQuery = `INSERT INTO responses VALUES('${userId}', ${optionId})`;
    getConnection().query(insertResponseQuery, err => {
      if (err) console.error("Error inserting response: ", err);
    });  
  });
};

const upsertUser = ({ id, username }) => {
  const query = `INSERT INTO users VALUES('${id}', '${username}') ON DUPLICATE KEY UPDATE username = '${username}'`;
  getConnection().query(query, err => {
    if (err) console.error("Error upserting user: ", err);
  });
};

module.exports = {
  getNewMessages,
  upsertMessage,
  toggleResponse,
  upsertUser,
  getMessageById,
  getPollResponses
};
