const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require("ms")

module.exports = {
    name: "loja",
    aliases: ["shop"],
    desc: 'Verifica a loja diária.',
    uso: '',
    cooldown: 10000,
    run: async (client, message, args, config, database) => {

        if (!Object.values(config.perms.dev).includes(message.author.id)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, comando temporariamente indisponível, tente novamente mais tarde.`)

    }
}