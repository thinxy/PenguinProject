const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')
const moment = require('moment')

module.exports = {
    name: 'coinflip',
    aliases: ['apostar', 'caraoucoroa', 'bet'],
    description: 'Chama um usuário para apostar safiras em um simples cara ou coroa.',
    uso: '<usuário> <valor>',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'money util stats'), user = await client.function.find(args[0], client, message, false)

        if (['stats', 'estatisticas', 'estatistícas'].includes(args[0])) {
            user = await client.function.find(args[1], client, message, true)

            let stats = await database.get(user.id, 'User', 'money stats')
            message?.reply(`${config.money.emoji} **${config.text.separator}** ${message.author}, abaixo estão ${user.id == message.author.id ? 'suas estatísticas' : `as estatísticas de \`${user.tag} (${user.id})\``} do **"Bet""** apostado: \n>>> **Apostas Ganhas**: \`${stats.stats.bet.win.toLocaleString('de-DE')}\` \`(${await client.function.percentage(stats.stats.bet.win, stats.stats.bet.played, 2)})\`\n**Apostas Perdidas**: \`${stats.stats.bet.lose.toLocaleString('de-DE')}\` \`(${await client.function.percentage(stats.stats.bet.lose, stats.stats.bet.played, 2)})\`\n**Apostas Efetuadas**: \`${stats.stats.bet.played.toLocaleString('de-DE')}\`\n**Valor Ganho**: \`${stats.stats.bet.profit.toLocaleString('de-DE')} Libras\` \`(${await client.function.percentage(stats.stats.bet.profit, stats.stats.bet.bet, 2)})\`\n**Valor Perdido**: \`${stats.stats.bet.loss.toLocaleString('de-DE')} Libras\` \`(${await client.function.percentage(stats.stats.bet.loss, stats.stats.bet.bet, 2)})\`\n**Valor Apostado**: \`${stats.stats.bet.bet.toLocaleString('de-DE')} Libras\``)
        } else {
            if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me com quem você quer apostar.`)
            if (user.id == message.author.id) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode apostar consigo mesmo.`)

            let docm = await database.get(user.id, 'User', 'money util'),
                ban = await database.ban(user.id),
                value = await client.function.number(args[1], doc.money, docm.money)

            if (!value) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me quanto você deseja apostar com esse usuário.`)
            if (isNaN(value)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa me falar uma quantia válida para apostar.`)
            if (value < 20) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa apostar no mínimo **20 ${config.money.name}**.`)
            if (value > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem tantas ${config.money.name.toLowerCase()} assim para apostar, tente apostar um valor mais baixo.`)
            if (doc.util.passive == true) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa desativar o **modo passivo** para executar essa ação.`)
            if (docm.util.passive == true) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, esse usuário está no **modo passivo** e por isso não pode receber apostas de cara ou coroa.`)
            if (value > docm.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, esse usuário não tem tantas libras assim para apostar.`)
            if (ban.is == true) return message?.reply(ban.msg)

            var msg = await message?.reply(`${config.money.emoji} **${config.text.separator}** ${user} \`(${user.id})\`, o usuário ${message.author} \`(${message.author.id})\` deseja fazer uma **aposta** com você no valor de **${value.toLocaleString('de-DE')} ${config.money.name}**, para aceitar os dois devem clicar em **"✅"**.`)
            msg.react('✅')

            let filter = (r, u) => r.emoji.name === `✅` && u.id === user.id || u.id === message.author.id, collector = msg?.createReactionCollector({ time: 60000, filter: filter })

            collector.on('collect', async (r, u) => {

                let reactions = msg.reactions.cache.get('✅').users.cache.filter(u => !u.bot && u.id).map(x => x.id)
                if (reactions.includes(user.id) && reactions.includes(message.author.id)) {
                    collector.stop('success')

                    doc = await database.get(message.author.id, 'User', 'money'), docm = await database.get(user.id, 'User', 'money')
                    let users = [message.author.id, user.id],
                        winner = await client.users.fetch(users[Math.floor(Math.random() * users.length)]),
                        loser = await client.users.fetch(users.filter(x => x != winner)[0])

                    if (doc.money < value || docm.money < value) return

                    let tax = await client.function.tax(winner.id, value)
                    msg?.reply(`${config.emojis.success} ${config.text.separator} ${winner} \`(${winner.id})\`, **parabéns**! Você ganhou a aposta contra ${loser} \`(${loser.id})\` e recebeu **${tax == value ? value.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + ` \`(Taxa de ${(value - tax).toLocaleString('de-DE')})\``} ${config.money.name}**.`)

                    database.sub(loser.id, value), database.add(winner.id, tax)
                    database.tr(loser.id, false, value, `apostando com \`${winner.tag}\` \`(${winner.id})\``), database.tr(winner.id, true, value, `apostando com \`${loser.tag}\` \`(${loser.id})\``)
                    database.bet(loser.id, winner.id, value)
                }
            })
        }
    }
}