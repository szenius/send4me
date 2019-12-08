const { Message } = require("./message");

class Poll extends Message {
  constructor(text, sendDate, closeDate, chatId, options) {
    super(text, sendDate, closeDate, chatId);
    this.isPoll = true;
    this.isSent = false;
    this.isClosed = false;

    this.responses = new Map();
    options.map(option => this.responses.set(option, []));
  }

  addResponse(option, user) {
    if (!this.isClosed) {
      this.responses.get(option).push(user);
    }
  }

  getText() {
    let text = `${this.text}\n\n`;
    for (let [option, users] of this.responses) {
      text += `${option}:\n`;
      text +=
        users.length === 0
          ? "\n"
          : `${Array.join(
              users.map(user => user.username),
              ", "
            )}\n\n`;
    }
    return text.trim();
  }

  getResponseForOption(option) {
    return this.responses.get(option);
  }

  getAllResponses() {
    return this.responses;
  }
}

module.exports = {
  Poll
};

// /**
//  * Inline menu for Default RSVPs
//  */
// const defaultRsvpMenu = Markup.inlineKeyboard(
//   [
//     Markup.callbackButton(getMenuButtonText(ACTION_COMING), ACTION_COMING),
//     Markup.callbackButton(
//       getMenuButtonText(ACTION_NOT_COMING_WORK_SCHOOL),
//       ACTION_NOT_COMING_WORK_SCHOOL
//     ),
//     Markup.callbackButton(
//       getMenuButtonText(ACTION_NOT_COMING_SICK),
//       ACTION_NOT_COMING_SICK
//     ),
//     Markup.callbackButton(
//       getMenuButtonText(ACTION_NOT_COMING_OTHERS),
//       ACTION_NOT_COMING_OTHERS
//     )
//   ],
//   { columns: 1 }
// ).extra();
