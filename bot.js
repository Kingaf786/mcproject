console.log("Bot script started")
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear, GoalFollow } = goals
// === PERMISSIONS ===
const OWNER = 'sayedafaq' // <-- change this to YOUR username
const HOSTILE_MOBS = ['zombie', 'skeleton', 'creeper', 'spider']

const bot = mineflayer.createBot({
  host: 'mcproject.aternos.me',
  port: 28162,
  username: 'EduBot',
  version: '1.21.8'

})
bot.loadPlugin(pathfinder)

bot.once('spawn', () => {
  console.log('Bot has spawned in the world')

  const movements = new Movements(bot)

  // === SAFETY RULES ===
  movements.canDig = false          // do not destroy blocks
  movements.allow1by1towers = false // no pillar jumping
  movements.canWalkOnLava = false
  movements.canWalkOnFire = false

  bot.pathfinder.setMovements(movements)
})

bot.on('physicsTick', () => {
  const entities = Object.values(bot.entities)
  
  for (const e of entities) {
    if (!e.displayName) continue
    if (!HOSTILE_MOBS.includes(e.displayName)) continue
    
    const distance = bot.entity.position.distanceTo(e.position)
    
    if (distance < 6) {
      bot.chat("Danger nearby! Moving away.")
      
      const away = bot.entity.position.offset(
        bot.entity.position.x - e.position.x,
        0,
        bot.entity.position.z - e.position.z
      )
      
      bot.pathfinder.setGoal(new GoalNear(away.x, away.y, away.z, 2))
      isFollowing = false
      break
    }
  }
})
bot.on('move', () => {
  const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  if (!blockBelow) return

  if (blockBelow.name.includes('lava')) {
    bot.chat("Lava detected. Stopping.")
    bot.pathfinder.setGoal(null)
    isFollowing = false
  }
})

bot.on('login', () => {
  console.log('Bot logged into server')
})

bot.on('spawn', () => {
  console.log('Bot spawned in world')
})

bot.on('end', () => {
  console.log('Bot disconnected from server')
})

bot.on('error', (err) => {
  console.log('Bot error:', err)
})
let isFollowing = false

// Single chat handler (merged and fixed)
bot.on('chat', (username, message) => {
  // Prevent responding to itself
  if (username === bot.username) return

  // Only allow owner to use commands
  if (username !== OWNER) return

  // Normalize the message
  message = message.toLowerCase()

  // Only handle commands starting with '!'
  if (!message.startsWith('!')) return
  const command = message.slice(1)

  // Simple chat replies (using command form)
  if (command === 'hello') {
    bot.chat(`Hello, ${username}! I am online.`)
    return
  }

  if (command === 'how are you') {
    bot.chat("I am a bot. I don't have feelings, but I am operational!")
    return
  }

  // Movement commands
  if (command === 'get around') {
    isFollowing = false

    const pos = bot.entity.position.offset(
      Math.floor(Math.random() * 10) - 5,
      0,
      Math.floor(Math.random() * 10) - 5
    )

    bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1))
    bot.chat("Exploring nearby.")
    return
  }

  if (command === 'follow') {
    const target = bot.players[username]?.entity
    if (!target) {
      bot.chat("I can't see you.")
      return
    }

    bot.pathfinder.setGoal(new GoalFollow(target, 2), true)
    isFollowing = true
    bot.chat("Following you.")
    return
  }

  if (command === 'come') {
    const target = bot.players[username]?.entity
    if (!target) {
      bot.chat("I can't see you.")
      return
    }

    isFollowing = false
    const pos = target.position
    bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1))
    bot.chat("Coming to you.")
    return
  }

  if (command === 'stop') {
    bot.pathfinder.setGoal(null)
    isFollowing = false
    bot.chat("Stopped.")
    return
  }
})
setInterval(() => {
  if (bot.pathfinder.isMoving()) return  // skip if already moving
  if (isFollowing) return                // skip if following

  const pos = bot.entity.position.offset(
    Math.floor(Math.random() * 4) - 2,
    0,
    Math.floor(Math.random() * 4) - 2
  )

  bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1))
}, 15000)
