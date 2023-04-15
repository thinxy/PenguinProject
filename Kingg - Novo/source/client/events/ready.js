const { ActivityType } = require('discord.js')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        let names = [
            `Estou atualmente em ${client.guilds.cache.size} servidores`,
            `Venha para meu servidor oficial! (discord.gg/kingg)`
        ], stats = 0

        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: names[stats++ % names.length], type: ActivityType.Playing }], status: 'online'
            })
        }, 15000)

        console.log(`Working on  ${client.user.tag} - ${client.user.id}`)
    }
}
