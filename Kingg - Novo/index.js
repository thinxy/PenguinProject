const { GatewayIntentBits, Collection, Client: Bot } = require('discord.js');
const { connect } = require("mongoose");
const { config } = require('dotenv');

const Translate = require('@iamtraction/google-translate')

const Client = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    sweepers: {
        messages: {
            interval: 60,
            lifetime: 600
        }
    }
})

// COLLECTIONS

Client.commands = new Collection()
Client.aliases = new Collection()
Client.cooldown = new Collection()
Client.blackjack = new Collection()

// CLIENT

Client.database = require('./source/database/main')
Client.function = require('./source/utils/function/main')
Client.config = require('./source/utils/json/config.json')

// FILES

const events = require('fs').readdirSync('./source/client/events').filter(file => file.endsWith('.js'))

// SCHEMA

const Users = require('./source/database/models/users')
const Guilds = require('./source/database/models/guild')
const Reminders = require('./source/database/models/remind')
const Raffle = require('./source/database/models/raffle');

// FUNCTIONS

Client.await = (ms) => new Promise((resolve) => setTimeout(() => { resolve() }, ms))

// COMMANDS AND EVENTS

for (let file of events) {
    let event = require(`./source/client/events/${file}`)
    if (event.once) {
        Client.once(event.name, (...args) => event.execute(Client, ...args))
    } else {
        Client.on(event.name, (...args) => event.execute(Client, ...args))
    }
}

require('fs').readdirSync('./source/client/commands/prefix/').forEach(folder => {
    let commands = require('fs').readdirSync(`./source/client/commands/prefix/${folder}`).filter(file => file.endsWith('.js'))
    for (let file of commands) {
        let pull = require(`./source/client/commands/prefix/${folder}/${file}`)
        if (pull.name) { Client.commands.set(pull.name, pull) }
        if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(x => Client.aliases.set(x, pull.name))
    }
})

// PROCCESS

process.on('uncaughtException', e => {
    console.log('An error has occurred: \n\n' + e.stack)
})
process.on('unhandledRejection', e => {
    console.log('An error has occurred: \n\n' + e.stack)
})

// START SOURCE

config()

connect(process.env.MONGO_URL)
    .then(console.log("Connected with MongoDB! (Cluster - Crown)"))
    .catch(e => console.log(e))

Client.login(process.env.DISCORD_TOKEN)