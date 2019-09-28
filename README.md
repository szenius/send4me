# Bless Administrative Bot
We want to spend more time doing good than enabling ourselves to do good. Hence the birth of the Bless Administrative Bot, which aims to automate administrative processes like attendance taking and sending reminders.

## User Guide
This bot is still in the testing phase, so it's not opened to public yet. However, you may [drop me an email](mailto:ting.szeying@gmail.com) should you wish to be a tester once the bot is opened for private beta testing.

Otherwise, you can also set up your own bot instance using the [Developer Guide](#developer-guide) below. 

## Developer Guide
### Setting Up
1. Clone this repository.
2. Add a .env file in the root of your project directory with the following key value pairs:
    ```
    BOT_TOKEN=<add your bot token here>
    CHAT_ID=<add your chat id here>
    HEROKU_APP_URL=<the heroku url your bot is deployed to>
    RUN_INTERVAL=<interval between your bot pings>
    ```

*Notes on `.env` file*:
* `HEROKU_APP_URL` is required for your app to keep pinging your heroku server, so it doesn't go down after 30 minutes of inactivity.
* `CHAT_ID` is required as currently the bot can only run for a specific chat defined by the chat id. You may set this id to different values for testing in different environments. 

Please note that you will have to add the bot into the chat group specified by `CHAT_ID` and allow it permissions to read and write messages. 

### Getting Started
```
npm start
```

and your bot should be up and running.