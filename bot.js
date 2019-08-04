const Telegraf = require("telegraf");
const RSVP = require('./rsvp.js');

const bot = new Telegraf(process.env.BOT_TOKEN, {polling: true});

/** Constant messages */
const MSG_START =
  "Hi there! I can help you manage your volunteers attendance. Start by adding me into a group.";
const MSG_HELP = "Help message coming soon";

/** Mode Flags */
let addingNewRsvp = false;

/** RSVP */
let latestRSVP = null;

/** Static Commands */
bot.start(ctx => ctx.reply(MSG_START));
bot.help(ctx => {
  ctx.reply(MSG_HELP);
});
bot.command("new_rsvp", ctx => {
  addingNewRsvp = true;
  latestRSVP = new RSVP();
  ctx.reply(`Creating new event.\nPlease tell me the description of your event.`);
});

/** Parse Messages */
bot.on('text', ctx => {
  if (addingNewRsvp) {
      if (latestRSVP.description === null) {
        latestRSVP.addDescription(ctx.message.text);
        ctx.reply('Input an option for voters:');
      } else if (ctx.message.text === '/end') {
        ctx.reply(latestRSVP.toString());
        addingNewRsvp = false;
      } else {
        latestRSVP.addOption(ctx.message.text);
        ctx.reply('Input an option for voters or do /end to stop:');
      }
  }
});

bot.launch();
