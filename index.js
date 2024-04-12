const mineflayer = require("mineflayer");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const index = fs.readFileSync("./index.html", "utf8");
const favicon = fs.readFileSync("./favicon.ico", "binary");

const bots = {}; // There might be some scaling issues

function actionDecider(action, user, data) {
  console.log({ action, user, data });

  switch (action) {
    case "wakeup":
      return ["application/json", { message: "I'M SOOOOOOOOOOO TIRED" }];
    case "create":
      const [username, ip, port] = data.split(","); // For now, we only support offline mode.
      const id = crypto.randomBytes(32).toString("hex");
      const bot = mineflayer.createBot({
        username: username || `Bromine_${id.slice(0, 8)}`,
        host: ip,
        port: port || 25565,
      });
      bot.messages = [];
      bot.id = id;
      bot.online = false;
      bot.once("spawn", function () {
        this.online = true;
      });
      bot.on("message", (jsonMsg, position) =>
        this.messages.push({ jsonMsg, position }),
      );
      bot.on("kicked", function (res, log) {
        this.online = false;
        this.kickReason = res;
      });
      bots[id] = bot;
      return ["application/json", { id }];
    case "move":
      const [packet, use] = data.split(",");
      bots[user].setControlState(packet, JSON.parse(use));
      return [
        "application/json",
        { data: { position: bots[user].entity.position } },
      ];
    case "look":
      const [yaw, pitch] = data.split(",");
      bots[user].look(yaw, pitch, true);
      return [
        "application/json",
        {
          data: { yaw: bots[user].entity.yaw, pitch: bots[user].entity.pitch },
        },
      ];
    case "quit":
      const [reason, kick] = data.split(",");
      kick = JSON.parse(kick);
      if (kick) bots[user].end(reason);
      delete bots[user];
      return ["application/json", {}];
    case "chatsend":
      let message = data;
      bots[user].chat(message);
      return ["application/json", { message }];
    case "getdata":
      const bot = bots[user];
      const clear = JSON.parse(data);
      const messages = bot.messages;
      if (clear) bot.messages = [];
      let viewDistance = 2; // This is in blocks, not chunks. This will give a 5x5x5 cube of the world, centered around the player's position.
      return [
        "application/json",
        {
          data: {
            messages,
            online: bot.online,
            position: bot.entity.position,
            yaw_pitch: [bot.entity.yaw, bot.entity.pitch],
            blocks: Object.assign(
              ...bots[user]
                .findBlocks({
                  matching: () => true,
                  maxDistance: viewDistance,
                  count: (viewDistance * 2 + 1) ** 3,
                })
                .map((a, b, c) => {
                  return { [a.toString()]: bot.blockAt(a) };
                }),
            ),
            // chunk: bot.world.getColumn(bot.entity.position.x >> 4, bot.entity.position.z >> 4),
            // world: bot.world.getColumns(),
            // players: bot.players,
            // player: bot.player,
            // entities: bot.entities;
          },
        },
      ];
    case "favicon.ico":
      return ["image/x-icon", favicon];
    default:
      return ["text/html", index];
  }
}

function botHandler(req, res) {
  const [action, user, data] = req.url.slice(1).split("/", 3); // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://bromine-mw3o.onrender.com/[ACTION]/[USER]/[DATA]
  try {
    const [contentType, value] = actionDecider(
      action,
      user,
      decodeURIComponent(data),
    );
    res.writeHead(200, { "Content-Type": c });
    if (contentType === "application/json") {
      response.success = true;
      res.write(JSON.stringify(value));
    } else {
      res.write(value);
    }
  } catch (e) {
    console.error(e);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.write("{ success: false }");
  }
  res.end();
  // another half a miracle happens
}

http.createServer(botHandler).listen(process.env.PORT || 3000);
console.log(`Server started on port ${process.env.PORT || 3000}`);
