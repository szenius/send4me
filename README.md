# Bringing Love to Every Single Soul (BLESS)
BLESS is a registered non-religious, Non-Profit Organisation, incorporated on 21 June 2014. With an overarching framework of “A Community for Community”, BLESS recognises the bountiful potential of social capital and actively targets the community as a focal point of intervention.

# BLESS Administrative Bot
We want to spend more time doing good than enabling ourselves to do good. Hence the birth of the BLESS Administrative Bot, which aims to automate administrative processes like attendance taking and sending reminders for volunteer management.

## User Guide
This bot is still in the testing phase, so it's not opened to public yet. However, you may [drop me an email](mailto:ting.szeying@gmail.com) should you wish to be a tester once the bot is opened for private beta testing.

Otherwise, you can also set up your own bot instance using the [Developer Guide](#developer-guide) below. 

## Developer Guide
### Setting Up
1. Clone this repository.
2. Add a .env file in the root of your project directory with the following key value pairs:
    ```
    BOT_TOKEN=<add your bot token here>
    HEROKU_APP_URL=<the heroku url your bot is deployed to>
    RUN_INTERVAL=<interval between your bot pings>
    ```

*Notes on `.env` file*:
* `HEROKU_APP_URL` is required for your app to keep pinging your heroku server, so it doesn't go down after 30 minutes of inactivity.

### Getting Started
```
npm start
```

and your bot should be up and running.