const express = require("express");
const line = require("@line/bot-sdk");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
// create LINE SDK client
const client = new line.Client(config);

app.get("/", (req, res) => {
  res.send('ok');
});

app.get("/send/:text", async (req, res) => {
  try {
    const text = req.params.text || "";

    const message = {
      type: "text",
      text: text,
    };

    const result = await client.pushMessage(config.channelSecret, message);
    res.json({ code: 200, message: result });
  } catch (error) {
    res.status(error.statusCode).send(error.message);
  }
});

// about the middleware, please refer to doc
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  // Create a new message.
  const response = {
    type: "text",
    text,
  };

  // use reply API
  return client.replyMessage(event.replyToken, response);
}

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT}`);
});
