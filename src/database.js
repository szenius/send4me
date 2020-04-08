const moment = require('moment');
const {getPromisePool} = require('./mysql');

const getChatsByAdminUserId = async userId => {
  const query =
    "SELECT c.name, c.chat_id FROM (admin a INNER JOIN chats c ON a.chat_id = c.chat_id) WHERE a.user_id = ?";
  return getPromisePool().query(query, [userId]);
};

const getNewMessages = async () => {
  const now = moment.utc().format('YYYY-MM-DD HH:mm:ss');
  const query = 'SELECT * FROM messages WHERE send_date < ? AND close_date > ? AND is_sent = ?';
  return getPromisePool().query(query, [now, now, false]);
};

const getPollResponses = async (messageId, chatId) => {
  const query =
    'SELECT o.text, o.option_id, u.user_id, u.username, u.first_name FROM (options o LEFT JOIN responses r ON o.option_id = r.option_id) LEFT JOIN users u ON r.user_id = u.user_id WHERE o.message_id = ? AND o.chat_id = ? ORDER BY o.option_id ASC';
  return getPromisePool().query(query, [messageId, chatId]);
};

const getMessageById = async (messageId, chatId) => {
  const query = 'SELECT * FROM messages WHERE message_id = ? AND chat_id = ?';
  return getPromisePool().query(query, [messageId, chatId]);
};

const insertMessage = async ({content, sendDate, closeDate, isPoll, chatId}) => {
  const query =
    'INSERT messages (content, send_date, close_date, is_poll, is_sent, is_closed, chat_id) VALUES (?, ?, ?, ?, ?)';
  return getPromisePool().query(query, [content, sendDate, closeDate, isPoll, chatId]);
};

const updateMessageByMessageAndChatId = async (message, newMessageId) => {
  const query =
    'UPDATE messages SET message_id = ?, content = ?, send_date = ?, close_date = ?, is_poll = ?, is_sent = ?, is_closed = ?, chat_id = ? WHERE message_id = ? AND chat_id = ?';
  return getPromisePool().query(query, [
    newMessageId,
    message.content,
    moment(message.send_date).format('YYYY-MM-DD HH:mm:ss'),
    moment(message.close_date).format('YYYY-MM-DD HH:mm:ss'),
    message.is_poll,
    message.is_sent,
    message.is_closed,
    message.chat_id,
    message.message_id,
    message.chat_id,
  ]);
};

const toggleResponse = async (userId, optionId, messageId) => {
  const query = 'SELECT * FROM responses WHERE user_id = ? AND option_id = ?';
  const [rows] = await getPromisePool().query(query, [userId, optionId]);

  if (rows.length === 1) {
    await deleteResponse(userId, optionId);
    return false;
  } else {
    await insertResponse(userId, optionId, messageId);
    return true;
  }
};

const deleteResponse = async (userId, optionId) => {
  const query = 'DELETE FROM responses WHERE user_id = ? AND option_id = ?';
  return getPromisePool().query(query, [userId, optionId]);
};

const insertResponse = async (userId, optionId, messageId) => {
  const deleteOtherResponsesQuery =
    'DELETE FROM responses WHERE user_id = ? AND option_id IN (SELECT o.option_id FROM messages m LEFT JOIN options o ON m.message_id = o.message_id WHERE m.message_id = ?)';
  await getPromisePool().query(deleteOtherResponsesQuery, [userId, messageId]);
  const insertResponseQuery = 'INSERT INTO responses VALUES(?, ?)';
  return getPromisePool().query(insertResponseQuery, [userId, optionId]);
};

const upsertUser = async ({id, username, first_name, last_name}) => {
  const usernameVal = username && username !== 'null' ? username : null;
  const firstNameVal = first_name && first_name !== 'null' ? first_name : null;
  const lastNameVal = last_name && last_name !== 'null' ? last_name : null;
  const query =
    'INSERT INTO users VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = ?, first_name = ?, last_name = ?';
  return getPromisePool().query(query, [
    id,
    usernameVal,
    firstNameVal,
    lastNameVal,
    usernameVal,
    firstNameVal,
    lastNameVal,
  ]);
};

module.exports = {
  getChatsByAdminUserId,
  getNewMessages,
  insertMessage,
  updateMessageByMessageAndChatId,
  toggleResponse,
  upsertUser,
  getMessageById,
  getPollResponses,
};
