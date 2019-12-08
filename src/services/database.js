const moment = require("moment");
const { getConnection } = require("../mysql");

const getNewMessages = callback => {
  const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  const query = `SELECT * FROM messages WHERE send_date < '${now}' AND close_date > '${now}' AND is_sent = false`;
  getConnection().query(query, (err, result) => {
    callback(err, result);
  });
};

const getOptionsForMessage = (messageId, chatId, callback) => {
  const query = `SELECT * FROM options WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  console.log('getting options for message');
  getConnection().query(query, (err, result) => {
    if (err) console.error("Error getting options for message: ", err);
    const optionIds = result.map(option => option.id);
    const responseByOptionQuery = `SELECT * FROM responses WHERE option_id IN (${optionIds.toString()}) GROUP BY option_id`;
    console.log('getting responses by options');
    console.log(responseByOptionQuery);
    getConnection(responseByOptionQuery, (_err, responses) => {
      if (_err) console.error("Error getting responses by options: ", err);
      console.log('ok');
      callback(_err, result, responses);
    })
  });
};

const getMessageById = (messageId, chatId, callback) => {
  const query = `SELECT * FROM messages WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  getConnection().query(query, (err, result) => {
    callback(err, result);
  })
}

const upsertMessage = (message, newMessageId) => {
  const query = `UPDATE messages SET message_id = '${newMessageId}', text = '${
    message.text
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

const toggleResponse = (userId, optionId) => {
  const query = `SELECT * FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  console.log(query);
  getConnection().query(query, (err, result) => {
    if (err) console.error("Error toggling response: ", err);
    console.log('found response: ', result); // TODO: somehow this is always empty???
    if (result.length === 1) {
      console.log('delete');
      deleteResponse(userId, optionId);
    } else {
      insertResponse(userId, optionId);
    }
  });
};

const insertResponse = (userId, optionId) => {
  const query = `INSERT INTO responses VALUES('${userId}', ${optionId})`;
  getConnection().query(query, err => {
    if (err) console.error("Error inserting response: ", err);
  });  
}

const deleteResponse = (userId, optionId) => {
  const query = `DELETE FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  getConnection().query(query, err => {
    if (err) console.error("Error deleting response: ", err);
  });  

}

const upsertUser = ({ id, username }) => {
  const query = `REPLACE INTO users VALUES('${id}', '${username}')`;
  getConnection().query(query, err => {
    if (err) console.error("Error upserting user: ", err);
  });
};

module.exports = {
  getNewMessages,
  getOptionsForMessage,
  upsertMessage,
  toggleResponse,
  upsertUser,
  getMessageById
};
