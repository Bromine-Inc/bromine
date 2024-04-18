const mineflayer = require('mineflayer') // Put a decent chunk of the workload on a package made by someone else
const http = require('http') // We need a server to accept requests
const fs = require('fs') // We get the contents for index.html and favicon.ico
const crypto = require('crypto') // Cryptography time

async function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let html
let img
fs.readFile('./index.html', (err, data) => {
  html = data.toString()
  if (err) {
    throw err
  }
})
fs.readFile('./favicon.ico', (err, data) => {
  img = data.toString('binary')
  if (err) {
    throw err
  }
})

const bots = {} // There might be some scaling issues

async function actionDecider (action, user, data) {
  // Oh god please no not async!
  data = decodeURIComponent(data)
  console.log({ action, user, data })
  let status = 200
  let ctype = 'application/json'
  let response = {}
  let monkey
  if (!/^[0-9a-f]{64}$|na/.test(user)) {
    status = 400
    response = { success: false }
  } else {
    try {
      switch (action) {
        case 'wakeup':
          response = { success: true, message: "I'M SOOOOOOOOOOO TIRED" }
          break
        case 'favicon.ico':
          ctype = 'image/x-icon'
          response = img
          break
        case 'create':
          const [username, ip, port] = data.split(',') // For now, we only support offline mode.
          const id = crypto.randomBytes(32).toString('hex')
          const bot = mineflayer.createBot({
            username: username || `Bromine_${id.slice(0, 8)}`,
            host: ip,
            port: port || 25565
          })
          bot.messages = []
          bot.id = id
          bot.online = false
          bot.on('message', function (msg, pos) {
            this.messages.push({ jsonMsg: msg, position: pos })
          })
          bot.on('kicked', function (res, log) {
            this.online = false
            this.kickReason = res
          })
          bot.once('spawn', function () {
            this.online = true
          })
          bots[id] = bot
          while (bots[id].online !== true) {
            monkey = await sleep(50)
          }
          response = { success: true, id }
          break
        case 'move':
          const [packet, use] = data.split(',')
          const tuse = JSON.parse(use)
          bots[user].setControlState(packet, tuse)
          response = {
            success: true,
            data: { position: bots[user].entity.position }
          }
          break
        case 'look':
          const [yaw, pitch] = data.split(',')
          bots[user].look(yaw, pitch, true)
          response = {
            success: true,
            data: {
              yaw: bots[user].entity.yaw,
              pitch: bots[user].entity.pitch
            }
          }
          break
        case 'quit':
          [reason, kick] = data.split(',')
          kick = JSON.parse(kick)
          if (kick) {
            bots[user].end(reason)
          }
          delete bots[user]
          response = { success: true }
          break
        case 'chatsend':
          const message = data
          bots[user].chat(message)
          response = { success: true, message }
          break
        case 'getdata':
          const b = bots[user]
          const clear = JSON.parse(data)
          response = { success: true, data: {} }
          response.data.messages = b.messages
          if (clear) {
            bots[user].messages = []
          }
          response.data.online = b.online
          response.data.position = b.entity.position
          response.data.yaw_pitch = [b.entity.yaw, b.entity.pitch]
          const viewDistance = 2 // This is in blocks, not chunks. This will give a 5x5x5 cube of the world, centered around the player's position.
          response.data.blocks = Object.assign(
            ...bots[user]
              .findBlocks({
                matching: () => true,
                maxDistance: viewDistance,
                count: (viewDistance * 2 + 1) ** 3
              })
              .map(function (a, b, c) {
                const t = {}
                t[a.toString()] = bots[user].blockAt(a)
                return t
              })
          )
          break
        case 'compound':
          const actions = data.split(',')
          response = {
            success: true,
            data: actions.map(function (piece) {
              const [ac, dat] = piece.split('|')
              return actionDecider(ac, user, dat.replace(';', ','))[1]
            })
          }
          break
        default:
          response = html
          ctype = 'text/html'
          break
      }
    } catch (err) {
      response = { success: false }
      status = 400
      console.error(err)
    }
  }
  return [status, response, ctype]
}

function botHandler (req, res) {
  const [action, user, data] = req.url.slice(1).split('/', 3) // To do [ACTION] with a bot with id [ID] with data [DATA] send a request to https://bromine-mw3o.onrender.com/[ACTION]/[USER]/[DATA]
  actionDecider(action, user, data).then((a) => {
    const [s, r, c] = a
    const truer = c === 'application/json' ? JSON.stringify(r) : r
    res.writeHead(s, { 'Content-Type': c })
    res.write(truer)
    res.end()
  })
}

http.createServer(botHandler).listen(process.env.PORT || 3000)
console.log(`Server started on port ${process.env.PORT || 3000}`)
