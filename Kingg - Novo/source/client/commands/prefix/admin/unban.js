const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: 'devunban',
    aliases: ['unban'],
    description: 'Comando restrito.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        if (!Object.values(config.perms.adm).includes(message.author.id)) return;
        const user = await client.function.find(args[0], client, message, false)
        if (!user) return;

        message.react('✅')
        await database.users.updateOne({ _id: `${user.id}` }, {
            $set: { 'ban.is': false }
        })
    }
}