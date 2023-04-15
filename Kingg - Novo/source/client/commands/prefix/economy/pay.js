const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'pagar',
    aliases: ['pagamento', 'pay'],
    description: 'Envia um pagamento do seu saldo atual para outro usuário.',
    uso: '<usuário> <valor>',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'money'), user = await client.function.find(args[0], client, message, false), value = args[1]

        if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me para quem você quer enviar um pagamento.`)
        if (user.id == message.author.id) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode enviar um pagamento para si mesmo.`)

        let docm = await database.get({ _id: user.id }, 'User', 'money'),
            ban = await database.ban(user.id)
        value = await client.function.number(value, doc.money)

        if (!value) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me quanto você deseja enviar para esse usuário.`)
        if (isNaN(value)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa me falar uma quantia válida para enviar.`)
        if (value < 20) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa enviar no mínimo **20 ${config.money.name}**.`)
        if (value > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem tantos ${config.money.name} assim para enviar.`)
        if (ban.is == true) return message?.reply(ban.msg)

        var msg = await message?.reply(`${config.money.emoji} **${config.text.separator}** ${user} \`(${user.id})\`, o usuário ${message.author} \`(${message.author.id})\` deseja lhe enviar um pagamento no valor de **${value.toLocaleString('de-DE')} ${config.money.name}**, para aceitar os dois devem clicar em **"✅"**.`)
        msg.react('✅')

        let filter = (r, u) => r.emoji.name === `✅` && u.id === user.id || u.id === message.author.id, collector = msg?.createReactionCollector({ time: 60000, filter: filter })

        collector.on('collect', async (r, u) => {

            let reactions = msg.reactions.cache.get('✅').users.cache.filter(u => !u.bot && u.id).map(x => x.id)
            if (reactions.includes(user.id) && reactions.includes(message.author.id)) {
                collector.stop('success')
                doc = await database.get(message.author.id, 'User', 'money')

                if (doc.money < value) return

                msg?.reply(`${config.emojis.success} ${config.text.separator} ${user} \`(${user.id})\`, você recebeu **${value.toLocaleString('de-DE')} ${config.money.name}** de ${message.author} \`(${message.author.id})\`.`)

                database.sub(message.author.id, value)
                database.add(user.id, value)
                database.tr(message.author.id, false, value, `para \`${user.tag}\` \`(${user.id})\``)
                database.tr(user.id, true, value, `de \`${message.author.tag}\` \`(${message.id})\``)
            }
        })
    }
}