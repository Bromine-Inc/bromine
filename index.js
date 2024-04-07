var mineflayer = require("mineflayer"); // Put a decent chunk of the workload on a package made by someone else
var mcprotocol = require("minecraft-protocol"); // We need the class from here
var events = require("events");
var classt = require("class-transformer"); // We need to retrieve stuff from the database and convert it to a class
var http = require("http"); // We need a server to accept requests
var fApp = require("firebase/app"); // Get the firebase app
var fDat = require("firebase/database");
var fs = require("fs"); // We get the contents for index.html

var firebaseConfig = { // Config stuff
  apiKey: "AIzaSyDFFiw65z47zWeICeC3eRZhkcbE_pLU9BA", // For some reason it's ok to share the api key publicly
  authDomain: "b-romine.firebaseapp.com",
  projectId: "b-romine",
  storageBucket: "b-romine.appspot.com",
  messagingSenderId: "663671114255",
  appId: "1:663671114255:web:5dfbb8470b5a8ebc60b17a",
  measurementId: "G-JP0HTVJ203",
  databaseURL: "https://b-romine-default-rtdb.europe-west1.firebasedatabase.app/",
};

var app = fApp.initializeApp(firebaseConfig); // Initialize!
var database = fDat.getDatabase(app); // It's time for some data!
var fdref = fDat.ref(database);
var [child, get] = [fDat.child, fDat.get];

var [PtoC, CtoP] = [classt.plainToInstance, classt.instanceToPlain];

var html;
var img;
fs.readFile('./index.html', ((err, data) => {html = data.toString(); if (err) {throw err};}));
fs.readFile('./favicon.ico', ((err, data) => {img = data.toString("binary"); if (err) {throw err};}));

function readParse(id) {
  function parse(data) { // Sheesh
    let a = data.val()
    a._client.splitter.buffer = PtoC(Buffer, a._client.splitter.buffer);
    a._client.splitter = PtoC(mcprotocol.framing.Splitter, a._client.splitter);
    a._client.framer = PtoC(mcprotocol.framing.Framer, a._client.framer);
    a._client = PtoC(mcprotocol.Client, a._client);
    a = PtoC(events.EventEmitter, a); // Did you know the object returned by mineflayer.createBot() is just an EventEmitter?
    return a;
  }
  return get(child(fdref, id)).then(parse);
}

function actionDecider(action, user, data) {
  console.log({'action': action, 'user': user, 'data': data});
  var status = 200;
  var ctype = 'application/json';
  var response = {}
  switch (action) {     
    case "wakeup":
      var response = {"message": "I'M SOOOOOOOOOOO TIRED"};
      break;
    case "favicon.ico":
      var ctype = 'image/x-icon';
      var response = img;
      break;
    default:
      var response = html;
      var ctype = 'text/html';
      break;
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
