require("dotenv").config();
const Telegraf = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN || "";

let bot = null;

const initBot = () => {
  bot = new Telegraf(BOT_TOKEN, { polling: true });
  bot.command("health", ctx => {
    ctx.reply("OK");
  });
  bot.command("restart", ctx => {
    if (ctx.update.message.from.id === 38685842) {
      ctx
        .reply(
          "Restarting bot... Please wait for a few minutes while the bot starts up again."
        )
        .then(() => {
          process.exit(0);
        });
    }
  });
};

const launchBot = () => {
  bot.launch();
};

const getBot = () => {
  if (bot) {
    return bot;
  }
  throw new Error("Bot not initialised!");
};

module.exports = {
  initBot,
  launchBot,
  getBot
};
