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

function verifySignature(signature, body) {
  const channelSecret = config.channelSecret;
  const hmac = crypto.createHmac("SHA256", channelSecret);
  const hash = hmac.update(body).digest("base64");
  return hash === signature;
}

app.post("/webhook", (req, res) => {
  const signature = req.headers["x-line-signature"];
  const body = JSON.stringify(req.body);

  if (!verifySignature(signature, body)) {
    res.status(401).send("Invalid signature");
    return;
  }

  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.status(200).json(result))
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
    text: "hello",
  };

  // use reply API
  return client.replyMessage(event.replyToken, response);
}

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT}`);
});
