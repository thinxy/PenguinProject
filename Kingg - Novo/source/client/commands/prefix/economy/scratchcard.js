const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const scratchcard = require('../../../../utils/class/scratchcard')

module.exports = {
    name: 'raspadinha',
    aliases: ['scratchcard'],
    description: 'Compra uma raspadinha da sorte.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {
        return new scratchcard().start(client, message, args)
    }
}