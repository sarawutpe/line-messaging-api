const express = require("express");
const line = require("@line/bot-sdk");
const crypto = require("crypto");
require("dotenv").config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
// create LINE SDK client
const client = new line.Client(config);

function verifySignature(signature, body) {
  const channelSecret = config.channelSecret;
  const bodystring = JSON.stringify(body);

  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(bodystring)
    .digest("base64");

  return signature === hash;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const signature = req.headers["x-line-signature"];
    const body = req.body;

    if (!verifySignature(signature, body)) {
      res.status(401).send("Invalid signature");
      return;
    }

    const events = req.body.events;

    if (events.length > 0) {
      await events.map((item) => handleEvent(item));
    } else {
      res.status(200).send("ok");
    }
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// event handler
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  // Create a new message.
  const response = {
    type: "text",
    text: "hello",
  };

  // use reply API
  return client.replyMessage(event.replyToken, response);
}

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT}`);
});
