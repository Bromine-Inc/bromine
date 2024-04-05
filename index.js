var mineflayer = require("mineflayer"); // Put a decent chunk of the workload on a package made by someone else
var mcprotocol = require("minecraft-protocol"); // We need the class from here
var classt = require("class-transformer"); // We need to retrieve stuff from the database and convert it to a class
var func = require("firebase-functions"); // functions!
var http = require("http"); // We need a server to accept requests
var fApp = require("firebase/app"); // Get the firebase app
var fAnl = require("firebase/analytics"); // Idk why we need analytics
var fDat = require("firebase/database");
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
var analytics = fAnl.getAnalytics(app); // OMG IDK WHY I NEED THIS!!!
const database = fDat.getDatabase(app); // It's time for some data!

function databasePush() {
// a miracle happens
}

function actionDecider(action, user, data, req, res) {
  console.log({'action': action, 'user': user, 'data': data});
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(`<h1>Hello!</h1><p>${`${action}/${user}/${data}`}</p>`); // Will be implemented later
  res.end(); // It will think the request timed out if we don't do this!
}

function botHandler(req, res) {
  var [action, user, data] = req.url.slice(1).split('/', 3); // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://bromine-mw3o.onrender.com/[ACTION]/[USER]/[DATA] 
  actionDecider(action, user, data, req, res)
  // another half a miracle happens
}

//exports.api = func.http.onRequest(botHandler);
/*, {'Content-Type': 'application/json'}*/
http.createServer(botHandler).listen(process.env.PORT || 3000);
