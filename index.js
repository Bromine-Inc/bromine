var mineflayer = require("mineflayer"); // Put a decent chunk of the workload on a package made by someone else
var http = require("http"); // We need a server to accept requests
var fs = require("fs"); // We get the contents for index.html and favicon.ico
var crypto = require("crypto");

var html;
var img;
fs.readFile('./index.html', ((err, data) => {html = data.toString(); if (err) {throw err};}));
fs.readFile('./favicon.ico', ((err, data) => {img = data.toString("binary"); if (err) {throw err};}));

var bots = {}; // There might be some scaling issues

function actionDecider(action, user, data) {
  data = decodeURIComponent(data)
  console.log({'action': action, 'user': user, 'data': data});
  var status = 200;
  var ctype = 'application/json';
  var response = {}
  try {
  switch (action) {     
    case "wakeup":
      var response = {success: true, message: "I'M SOOOOOOOOOOO TIRED"};
      break;
    case "favicon.ico":
      var ctype = 'image/x-icon';
      var response = img;
      break;
    case "create":
      let [username, ip, port] = data.split(","); // For now, we only support offline mode.
      let id = crypto.randomBytes(32).toString('hex');
      let bot = mineflayer.createBot({username: username || `Bromine_${id.slice(0, 8)}`, host: ip, port: (port || 25565)});
      bot.messages = [];
      bot.id = id
      bot.on("message", function(msg, pos) {this.messages.push({jsonMsg: msg, position: pos})});
      bot.on("kick", function() {actionDecider("quit", this.id, "true")});
      bots[id] = bot;
      var response = {success: true, id: id};
      break;
    case "move":
      let [packet, use] = data.split(",");
      use = JSON.parse(use)
      bots[user].setControlState(packet, use);
      var response = {success: true, data: {position: bots[user].entity.position} };
      break;
    case "look":
      let [yaw, pitch] = data.split(",");
      bots[user].look(yaw, pitch);
      var response = {success: true, data: {yaw: bots[user].entity.yaw, pitch: bots[user].entity.pitch}};
      break;
    case "quit":
      [reason, kicked] = data.split(",")
      kicked = JSON.parse(kicked)
      if (kicked) {bots[user].end(reason)};
      delete bots[user];
      var response = {success: true};
      break;
    case "chatsend":
      let message = data;
      bots[user].chat(message);
      var response = {success: true, message: message}
      break;
    case "getdata":
      let b = bots[user];
      let clear = JSON.parse(data);
      var response = {success: true, data: {}};
      response.data.messages = b.messages;
      if (clear) {bots[user].messages = []};
      response.data.online = b.online
      //response.data.world = b.world.getColumns();
      //response.data.players = b.players;
      //response.data.player = b.player;
      //response.data.entities = b.entities;
      break; 
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
  return [status, response, ctype];
}

function botHandler(req, res) {
  var [action, user, data] = req.url.slice(1).split('/', 3); // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://bromine-mw3o.onrender.com/[ACTION]/[USER]/[DATA] 
  var [s, r, c] = actionDecider(action, user, data);
  var t = (c === 'application/json' ? JSON.stringify(r) : r);
  res.writeHead(s, {'Content-Type': c});
  res.write(t);
  res.end();
  // another half a miracle happens
}


http.createServer(botHandler).listen(process.env.PORT || 3000);
console.log(`Server started on port ${process.env.PORT || 3000}`)
