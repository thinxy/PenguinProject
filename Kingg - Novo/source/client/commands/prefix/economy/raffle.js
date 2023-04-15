const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'rifa',
    aliases: ['raffle'],
    desc: 'Verifica as informações da rifa atual, compra alguma quantidade de bilhetes para a rifa ou verifica quais usuários estão participando da rifa atual.',
    uso: '[comprar <quantidade>]',
    cooldown: 4000,
    run: async (client, message, args, config, database) => {
        let raffle = await database.get('816841271964467241', 'Raffle'), doc = await database.get(message.author.id, 'User', 'id money util')

        if (['comprar', 'buy'].includes(args[0])) {

            let value = await client.function.number(args[1], doc.money)

            if (!value || isNaN(args[1])) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não disse uma quantia válida de bilhetes para comprar.`)
            if (1 > value) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você deve comprar no mínimo um bilhete para essa rifa.`)
            if (25000 < value + doc.util.raffle) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você só pode comprar no máximo **25.000** bilhetes por rifa.`)
            if (doc.money < value * 500) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem tantas ${config.money.name.toLowerCase()} para comprar essa quantidade de bilhetes.`)

            await database.users.updateOne({ _id: message.author.id }, {
                $set: { 'util.raffle': doc.util.raffle + value }
            })
            database.sub(message.author.id, parseInt(value * 500)), database.tr(message.author.id, false, parseInt(value * 500), `para a rifa.`)

            let arr = raffle.users
            for (let i = 0; i < (value / 3); i++) {
                arr.push(message.author.id)
            }

            await database.raffle.updateOne({ _id: '816841271964467241' }, {
                $inc: { tickets: value, value: parseInt(value * 500), },
                $set: { users: arr }
            })

            message?.reply(`${config.money.emoji} **${config.text.separator}** ${message.author}, você comprou **${value.toLocaleString('de-DE')}** bilhetes por um total de **${parseInt(value * 500).toLocaleString('de-DE')} ${config.money.name}**, essa rifa será finalizada <t:${parseInt(raffle.time / 1000)}:R>, boa sorte!`)

        } else {

            let users = [...new Set(raffle.users)]

            let msg = await message?.reply({
                content: `${config.money.emoji} **${config.text.separator}** ${message.author}, essa é a rifa atual:\n> **Prêmio**: \`${raffle.value.toLocaleString('de-DE')} ${config.money.name}\`\n> **Bilhetes**: \`${raffle.tickets.toLocaleString()} Bilhetes\`\n> **Participantes**: \`${users.length}\`\n> **Finaliza em**: <t:${parseInt(raffle.time / 1000)}> \`(${durationTime(raffle.time, { displayAtMax: 2, removeMs: true })})\`\n> **Ùltimo ganhador**: ${raffle.last ? raffle.last : '`Ninguém...`'}\nPara comprar bilhetes utilize o comado \`.rifa comprar\`, cada bilhete custa **500 ${config.money.name}** cada.`
            })

        }

    }
}