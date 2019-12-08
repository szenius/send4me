const moment = require("moment");
const { buildSessionPoll } = require("../../src/services/pollBuilder");

describe("pollBuilder", () => {
  test("buildSessionPoll", () => {
    const mock = {
      sessionName: "test event",
      sessionDate: moment([2012, 8, 21, 20, 0]),
      chatId: "chat_id"
    };
    const sessionPoll = buildSessionPoll(
      mock.sessionName,
      mock.sessionDate,
      mock.chatId
    );

    expect(sessionPoll.getText()).toBe(
      `Hi volunteers, the next ${mock.sessionName} will be on Friday, Sep 21st, 8:00 PM. Please indicate your attendance below!\n\ncoming:\n\nnot coming:`
    );
    expect(sessionPoll.getSendDate().toString()).toBe(
      moment([2012, 8, 21 - 3, 20, 0]).toString()
    );
    expect(sessionPoll.getCloseDate().toString()).toBe(
      mock.sessionDate.toString()
    );
    expect(Array.from(sessionPoll.getAllResponses().keys())).toStrictEqual([
      "coming",
      "not coming"
    ]);
    expect(sessionPoll.getChatId()).toBe(mock.chatId);
  });
});
