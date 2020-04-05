const moment = require("moment");
const { getConnection } = require("./mysql");

const getNewMessages = async () => {
  const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  const query = `SELECT * FROM messages WHERE send_date < '${now}' AND close_date > '${now}' AND is_sent = false`;
  const conn = await getConnection();
  return conn.execute(query);
};

const getPollResponses = async (messageId, chatId) => {
  const query = `SELECT o.text, o.option_id, u.user_id, u.username, u.first_name FROM (options o LEFT JOIN responses r ON o.option_id = r.option_id) LEFT JOIN users u ON r.user_id = u.user_id WHERE o.message_id = ${messageId} AND o.chat_id = ${chatId} ORDER BY o.option_id ASC`;
  const conn = await getConnection();
  return conn.execute(query);
};

const getMessageById = async (messageId, chatId) => {
  const query = `SELECT * FROM messages WHERE message_id = '${messageId}' AND chat_id = '${chatId}'`;
  const conn = await getConnection();
  return conn.execute(query);
};

const upsertMessage = async (message, newMessageId) => {
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
  const conn = await getConnection();
  return conn.execute(query);
};

const toggleResponse = async (userId, optionId, messageId) => {
  const query = `SELECT * FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  try {
    const conn = await getConnection();
    const rows = (await conn.execute(query))[0];

    if (rows.length === 1) {
      await deleteResponse(userId, optionId);
      return false;
    } else {
      await insertResponse(userId, optionId, messageId);
      return true;
    }
  } catch (error) {
    console.error(`Error toggling response: ${query}`);
  }
};

const deleteResponse = async (userId, optionId) => {
  const query = `DELETE FROM responses WHERE user_id = '${userId}' AND option_id = ${optionId}`;
  const conn = await getConnection();
  return conn.execute(query);
};

const insertResponse = async (userId, optionId, messageId) => {
  const getOptionsForMessageQuery = `SELECT o.option_id FROM messages m LEFT JOIN options o ON m.message_id = o.message_id WHERE m.message_id = '${messageId}'`;
  try {
    const conn = await getConnection();
    const rows = (await conn.execute(getOptionsForMessageQuery))[0];
    const optionIds = rows.map(row => row.option_id);
    const deleteOtherResponsesQuery = `DELETE FROM responses WHERE option_id IN (${optionIds}) AND user_id = '${userId}'`;
    try {
      await conn.execute(deleteOtherResponsesQuery);
    } catch (error) {
      console.error(`Error deleting response: ${error}`);
    }
    const insertResponseQuery = `INSERT INTO responses VALUES('${userId}', ${optionId})`;
    try {
      await conn.execute(insertResponseQuery);
    } catch (error) {
      console.error(`Error inserting response: ${error}`);
    }
  } catch (error) {
    console.error(`Error getting options for message: ${error}`);
  }
};

const upsertUser = async ({ id, username, first_name, last_name }) => {
  const usernameVal =
    username && username !== "null" ? `'${username}'` : "NULL";
  const firstNameVal =
    first_name && first_name !== "null" ? `'${first_name}'` : "NULL";
  const lastNameVal =
    last_name && last_name !== "null" ? `'${last_name}'` : "NULL";
  const query = `INSERT INTO users VALUES('${id}', ${usernameVal}, ${firstNameVal}, ${lastNameVal}) ON DUPLICATE KEY UPDATE username = ${usernameVal}, first_name = ${firstNameVal}, last_name = ${lastNameVal}`;
  try {
    const conn = await getConnection();
    return conn.execute(query);
  } catch (error) {
    console.error(`Error upserting user: ${error}`);
  }
};

module.exports = {
  getNewMessages,
  upsertMessage,
  toggleResponse,
  upsertUser,
  getMessageById,
  getPollResponses
};
