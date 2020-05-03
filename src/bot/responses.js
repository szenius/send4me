const WELCOME =
  'Hello! I can help you schedule polls to be sent to a group on a regular basis. Use /schedule to get started.';

const SCHEDULE = {
  MESSAGE_CHOOSE_CHAT: 'Which of these chats do you want to schedule messages for?',
  MESSAGE_ADDING_SCHEDULE: 'Received file. Please wait as we schedule your messages...',
  MESSAGE_ADDED_SCHEDULE: 'Scheduled your messages. You can use /view to see them.',
  MESSAGE_UPLOAD_SCHEDULE_FILE: 'Please upload a schedule file.',
  MESSAGE_CSV_FILE_FORMAT:
    'Your CSV file should have the following columns:\n' +
    '\n' +
    '*message* — Text content in your scheduled message\n' +
    '*send_date* — _[YYYY-MM-DD]_ Date on which you want to send this scheduled message\n' +
    '\n' +
    'Example:\n' +
    '```\n' +
    '"message","send_date"\n' +
    '"Circuit Breaker starts today! Yes you can still get your bubble tea at the stores.","2020-04-07"\n' +
    '"Circuit Breaker extends today! Sorry but you cannot get your bubble tea anymore.","2020-05-05"\n' +
    '"Circuit Breaker ends today! You can get your bubble tea tomorrow.","2020-06-01"\n' +
    '```',
  ERROR_NOT_PRIVATE_CHAT: 'Scheduling only works in private conversations. Try direct messaging me!',
  ERROR_NOT_ADMIN:
    "It doesn't seem like you are an admin for any chat. To become an admin, please contact @szenius.",
  ERROR_NOT_CSV_FILE: 'Please upload a CSV file.',
};

module.exports = {
  WELCOME,
  SCHEDULE,
};
