const moment = require('moment');
const {getPromisePool} = require('./mysql');

const getNewMessages = async () => {
  const now = moment.utc().format('YYYY-MM-DD HH:mm:ss');
  const query = `SELECT * FROM messages WHERE send_date < '${now}' AND close_date > '${now}' AND is_sent = false`;
  return getPromisePool().query(query);
};

const getPollResponses = async (messageId, chatId) => {
  const query = `SELECT o.text, o.option_id, u.user_id, u.username, u.first_name FROM (options o LEFT JOIN responses r ON o.option_id = r.option_id) LEFT JOIN users u ON r.user_id = u.user_id WHERE o.message_id = ${messageId} AND o.chat_id = ${chatId} ORDER BY o.option_id ASC`;
  return getPromisePool().query(query);
};

const getMessageById = async (messageId, chatId) => {
  const query = `SELECT * FROM messages WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  return getPromisePool().query(query);
};

const insertMessage = async ({content, sendDate, closeDate, isPoll, chatId}) => {
  const query = `INSERT messages (content, send_date, close_date, is_poll, is_sent, is_closed, chat_id) VALUES ('${content}', '${sendDate}', '${closeDate}', '${isPoll}', '${chatId}')`;
  return getPromisePool().query(query);
}

const updateMessageByMessageAndChatId = async (message, newMessageId) => {
  const query = `UPDATE messages SET message_id = '${newMessageId}', content = '${
    message.content
  }', send_date = '${moment(message.send_date).format('YYYY-MM-DD HH:mm:ss')}', close_date = '${moment(
    message.close_date,
  ).format('YYYY-MM-DD HH:mm:ss')}', is_poll = ${message.is_poll}, is_sent = ${
    message.is_sent
  }, is_closed = ${message.is_closed}, chat_id = '${message.chat_id}' WHERE message_id = '${
    message.message_id
  }' AND chat_id = '${message.chat_id}'`;
  return getPromisePool().query(query);
};

const toggleResponse = async (userId, optionId, messageId) => {
  const query = `SELECT * FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  const [rows] = await getPromisePool().query(query);

  if (rows.length === 1) {
    await deleteResponse(userId, optionId);
    return false;
  } else {
    await insertResponse(userId, optionId, messageId);
    return true;
  }
};

const deleteResponse = async (userId, optionId) => {
  const query = `DELETE FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  return getPromisePool().query(query);
};

const insertResponse = async (userId, optionId, messageId) => {
  const getOptionsForMessageQuery = `SELECT o.option_id FROM messages m LEFT JOIN options o ON m.message_id = o.message_id WHERE m.message_id = '${messageId}'`;
  const [rows] = await getPromisePool().query(getOptionsForMessageQuery);
  const optionIds = rows.map((row) => row.option_id);
  const deleteOtherResponsesQuery = `DELETE FROM responses WHERE option_id IN (${optionIds}) AND user_id = '${userId}'`;
  await getPromisePool().query(deleteOtherResponsesQuery);
  const insertResponseQuery = `INSERT INTO responses VALUES('${userId}', ${optionId})`;
  await getPromisePool().query(insertResponseQuery);
};

const upsertUser = async ({id, username, first_name, last_name}) => {
  const usernameVal = username && username !== 'null' ? `'${username}'` : 'NULL';
  const firstNameVal = first_name && first_name !== 'null' ? `'${first_name}'` : 'NULL';
  const lastNameVal = last_name && last_name !== 'null' ? `'${last_name}'` : 'NULL';
  const query = `INSERT INTO users VALUES('${id}', ${usernameVal}, ${firstNameVal}, ${lastNameVal}) ON DUPLICATE KEY UPDATE username = ${usernameVal}, first_name = ${firstNameVal}, last_name = ${lastNameVal}`;
  return getPromisePool().query(query);
};

module.exports = {
  getNewMessages,
  upsertMessage: updateMessageByMessageAndChatId,
  toggleResponse,
  upsertUser,
  getMessageById,
  getPollResponses,
};
