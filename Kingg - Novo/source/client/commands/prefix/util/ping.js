const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'ping',
    aliases: ['latency', 'latência'],
    desc: 'Verifica a latência do bot em milissegundos.',
    uso: '',
    cooldown: 1500,
    run: async (client, message, args, config, database) => {
        let data = Date.now(), msg = await message?.reply(`Calculando...`)
        msg?.edit(`🏓 **${config.text.separator}** ${message.author}, minha velocidade de respota está em \`${msg.createdTimestamp - data}ms\` e minha latência em \`${client.ws.ping}ms\`.`)
    }
}