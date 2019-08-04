const Telegraf = require('telegraf')

const bot = new Telegraf('832296358:AAFo8cswdynzN8BR4Kd7_9hk65CyvMP5vGM')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
