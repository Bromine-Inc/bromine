const mineflayer = require("mineflayer") // Put a decent chunk of the workload on a package made by someone else
const http = require("http") // We need a server to accept requests

function databasePush {

}

function actionDecider (action, user) {

}

function botHandler (req, res) {
  var [action,user] = req.url.slice(1).split('/', 2) // To do [ACTION] with a bot with id [ID] send a request to /[ACTION]/[USER]. // URL unknown at time of writing.
  
}

http.createServer(botHandler).listen(8000);
