const mineflayer = require("mineflayer");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const index = fs.readFileSync("./index.html", "utf8");
const img = fs.readFileSync("./favicon.ico", "binary");

const bots = {}; // There might be some scaling issues

function actionDecider(action, user, data) {
  console.log({ action, user, data });

  switch (action) {
    case "wakeup":
      return ["application/json", { message: "I'M SOOOOOOOOOOO TIRED" }];
    case "create":
      const [username, ip, port] = data.split(","); // For now, we only support offline mode.
      const id = crypto.randomBytes(32).toString('hex');
      const bot = mineflayer.createBot({
        username: username || `Bromine_${id.slice(0, 8)}`,
        host: ip,
        port: port || 25565
      });
      bot.messages = [];
      bot.id = id;
      bot.online = false;
      bot.once("spawn", function() {
        this.online = true;
      });
      bot.on("message", (jsonMsg, position) => this.messages.push({ jsonMsg, position }));
      bot.on("kicked", function(res, log) {
        this.online = false;
        this.kickReason = res;
      });
      bots[id] = bot;
      return ["application/json", { id }];
    case "move":
      const [packet, use] = data.split(",");
      bots[user].setControlState(packet, JSON.parse(use));
      var response = {success: true, data: {position: bots[user].entity.position} };
      break;
    case "look":
      let [yaw, pitch] = data.split(",");
      bots[user].look(yaw, pitch, true);
      var response = {success: true, data: {yaw: bots[user].entity.yaw, pitch: bots[user].entity.pitch}};
      break;
    case "quit":
      [reason, kick] = data.split(",")
      kick = JSON.parse(kick)
      if (kick) bots[user].end(reason);
      delete bots[user];
      var response = {success: true};
      break;
    case "chatsend":
      let message = data;
      bots[user].chat(message);
      var response = {: true, message: message};
      break;
    case "getdata":
      let b = bots[user];
      let clear = JSON.parse(data);
      var response = {: true, data: {}};
      response.data.messages = b.messages;
      if (clear) {bots[user].messages = []};
      response.data.online = b.online;
      response.data.position = b.entity.position;
      response.data.yaw_pitch = [b.entity.yaw, b.entity.pitch];
      let viewDistance = 2; // This is in blocks, not chunks. This will give a 5x5x5 cube of the world, centered around the player's position.
      response.data.blocks = Object.assign(...bots[user].findBlocks({matching: () => true, maxDistance: viewDistance, count: (viewDistance*2+1)**3}).map(function(a,b,c){
        let t = {};
        t[a.toString()] = bots[user].blockAt(a);
        return t;
      }));
      //response.data.chunk = b.world.getColumn(b.entity.position.x >> 4, b.entity.position.z >> 4)
      //response.data.world = b.world.getColumns();
      //response.data.players = b.players;
      //response.data.player = b.player;
      //response.data.entities = b.entities;
      break;
    case "favicon.ico":
      return ["image/x-icon", img];
    default:
      var response = html;
      var ctype = 'text/html';
      break;
  } 
  } catch(err) {
    var response = {success: false};
    var status = 400;
    console.error(err);
  }
  return [status, ctype, response];
}

function botHandler(req, res) {
  var [action, user, data] = req.url.slice(1).split('/', 3); // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://bromine-mw3o.onrender.com/[ACTION]/[USER]/[DATA] 
  var [s, c, r] = actionDecider(action, user, decodeURIComponent(data));
  var t = (c === 'application/json' ? JSON.stringify(r) : r);
  res.writeHead(s, {'Content-Type': c});
  res.write(t);
  res.end();
  // another half a miracle happens
}


http.createServer(botHandler).listen(process.env.PORT || 3000);
console.log(`Server started on port ${process.env.PORT || 3000}`)
