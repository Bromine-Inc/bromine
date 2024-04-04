var mineflayer = require("mineflayer"); // Put a decent chunk of the workload on a package made by someone else
var mcprotocol = require("minecraft-protocol"); // We need the class from here
var classt = require("class-transformer"); // We need to retrieve stuff from the database and convert it to a class
var func = require("firebase-functions"); // functions!
/* const http = require("http"); // We need a server to accept requests
const fApp = require("firebase/app"); // Get the firebase app
const fAnl = require("firebase/analytics"); // Idk why we need analytics
const firebaseConfig = { // Config stuff
  apiKey: "AIzaSyDFFiw65z47zWeICeC3eRZhkcbE_pLU9BA", // For some reason it's ok to share the api key publicly
  authDomain: "b-romine.firebaseapp.com",
  projectId: "b-romine",
  storageBucket: "b-romine.appspot.com",
  messagingSenderId: "663671114255",
  appId: "1:663671114255:web:5dfbb8470b5a8ebc60b17a",
  measurementId: "G-JP0HTVJ203"
};
const app = fApp.initializeApp(firebaseConfig); // Initialize!
const analytics = fAnl.getAnalytics(app); // OMG IDK WHY I NEED THIS!!! */

function databasePush() {
// a miracle happens
}

function actionDecider(action, user, data) {
// another miracle happens
}

function botHandler(req, res) {
  var [action,user,data] = req.url.slice(1).split('/', 3) // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://b-romine.web.app//[ACTION]/[USER]/[DATA] // Site not up yet 
  console.log({'action': action, 'user': user, 'data': data})
  res.write(`<h1>Hello!</h1><p>${`${action}/${user}/${data}`}</p>`); // Will be implemented later
  // another half a miracle happens
}

//exports.api = func.http.onRequest(botHandler);
/*, {'Content-Type': 'application/json'}*/
http.createServer(botHandler).listen(process.env.PORT || 3000);
