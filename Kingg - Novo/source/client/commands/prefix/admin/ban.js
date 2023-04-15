const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: 'devban',
    aliases: ['ban'],
    description: 'Comando restrito.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        if (!Object.values(config.perms.adm).includes(message.author.id)) return;
        const user = await client.function.find(args[0], client, message, false),
            reason = args.slice(1)
        if (!user || !reason) return;

        message.react('✅')
        await database.users.updateOne({ _id: `${user.id}` }, {
            $set: { 'ban.is': true, 'ban.date': Date.now(), 'ban.reason': reason.join(' ') }
        })
    }
}