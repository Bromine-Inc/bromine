const mineflayer = require("mineflayer"); // Put a decent chunk of the workload on a package made by someone else
const http = require("http"); // We need a server to accept requests
const fApp = require("firebase/app"); // Get the firebase app
const fAnl = require("firebase/analytics"); // Idk why we need analytics
const firebaseConfig = { // Config stuff
  apiKey: "AIzaSyDFFiw65z47zWeICeC3eRZhkcbE_pLU9BA",
  authDomain: "b-romine.firebaseapp.com",
  projectId: "b-romine",
  storageBucket: "b-romine.appspot.com",
  messagingSenderId: "663671114255",
  appId: "1:663671114255:web:5dfbb8470b5a8ebc60b17a",
  measurementId: "G-JP0HTVJ203"
};
const app = fApp.initializeApp(firebaseConfig); // Initialize!
const analytics = fAnl.getAnalytics(app); // OMG IDK WHY I NEED THIS!!!

function databasePush () {
// a miracle happens
}

function actionDecider (action, user) {
// another miracle happens
}

function botHandler (req, res) {
  var [action,user] = req.url.slice(1).split('/', 2) // To do [ACTION] with a bot with id [ID] send a request to /[ACTION]/[USER]. // URL unknown at time of writing.
  // another half a miracle happens
}

http.createServer(botHandler).listen(8000);
// and that's a total of two and a half miracles.
