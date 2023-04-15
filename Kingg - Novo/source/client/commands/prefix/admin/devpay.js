const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'devpay',
    aliases: ['pix'],
    description: 'Comando restrito.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        if (!Object.values(config.perms.adm).includes(message.author.id)) return
        let doc = await database.get({ _id: message.author.id }, 'User', 'money'), user = await client.function.find(args[0], client, message, false), value = args[1]
        if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me para quem você quer enviar um pagamento.`)
        let docm = await database.get({ _id: user.id }, 'User', 'money')
        value = await client.function.number(value, doc.money)
        if (!value) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me quanto você deseja enviar para esse usuário.`)
        if (isNaN(value)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa me falar uma quantia válida para enviar.`)

        message.react('✅')
        database.add(user.id, value)
        database.tr(user.id, true, value, `do pagamento dos administradores`)
    }
}