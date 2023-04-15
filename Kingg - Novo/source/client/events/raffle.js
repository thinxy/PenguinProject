const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const raffledb = require('../../database/models/raffle')
const userdb = require('../../database/models/users')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        console.log('Loaded Raffle - Event.')

        setInterval(async () => {
            generateWin()
        }, 10000)

        async function generateWin() {

            let doc = await client.database.get('816841271964467241', 'Raffle')

            if (Date.now() > doc.time) {

                if (doc.users.length < 1) return await client.database.raffle.updateOne({ _id: '816841271964467241' }, {
                    $set: { time: parseInt(Date.now() + 3600000) }
                })

                let winner = await client.users.fetch(doc.users[parseInt(Math.random() * doc.users.length)]), user = await client.database.get(winner.id, 'User', 'money util'), tax = await client.function.tax(winner.id, doc.value)
                let embed = new EmbedBuilder()

                    .setTitle(`${client.config.money.emoji} **${client.config.text.separator}** Parabéns`)
                    .setColor(client.config.colors.default)
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setDescription(`**${winner.username}**, você ganhou  **${tax == doc.value ? doc.value.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + `\`(Taxa de ${(doc.value - tax).toLocaleString('de-DE')})\``} ${client.config.money.name}** na rifa.\nForam comprados um total de **${doc.tickets.toLocaleString('de-DE')} bilhetes** nessa rifa, dentre eles **${user.util.raffle.toLocaleString('de-DE')} bilhetes** foram seus. Sabia que você tinha **${await client.function.percentage(user.util.raffle, doc.tickets)}** de chance de ganhar? Que sorte!`)

                winner?.send({ embeds: [embed], content: winner.toString() }).catch(() => null)

                await client.database.add(winner.id, tax)
                await client.database.tr(winner.id, true, Number(doc.value), 'na rifa.')
                doc.last = `\`${winner.tag}\` \`(${winner.id})\` - **${doc.value.toLocaleString('de-DE')} ${client.config.money.name}**.`, doc.users = [], doc.value = 0, doc.tickets = 0, doc.time = Date.now() + require('ms')('1h')
                await doc.save()
                await client.database.users.updateMany({ "util.raffle": { $gt: 1 } }, { $unset: { "util.raffle": 0 } })
            }
        }
    }
}