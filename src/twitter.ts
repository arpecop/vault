const Twitter = require("twitter");
const fs = require("fs");

const client = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret,
});

const timeline = async (id: string) => {
  return new Promise((resolve): void => {
    client.get(
      "statuses/user_timeline",
      { screen_name: id },
      (error, tweets) => {
        if (!error) {
          resolve(tweets);
        } else {
          resolve([]);
        }
      }
    );
  });
};

module.exports = { timeline };
