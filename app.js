const express = require("express");
const line = require("@line/bot-sdk");

const app = express();
const port = 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

app.get("/", (req, res) => {
  res.send("ok");
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

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
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
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: "text", text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
