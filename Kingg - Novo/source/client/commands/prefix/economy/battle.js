const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'batalha',
    aliases: ['battle', 'batalhar'],
    description: 'Cria uma batalha onde até 25 usuários podem entrar para apostar.',
    uso: '<valor> [limite]',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'money'), value = args[0]

        if (!value) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me um valor válido para o duelo.`)
        value = await client.function.number(value, doc.money)
        if (isNaN(value)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, esse não é um valor válido para apostar em uma batalha.`)
        if (value < 10) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, uma batalha o valor precisa ser superior a **10 ${config.money.name}**.`)
        if (value > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem tantas ${config.money.name} para apostar.`)

        let limit = args[1], users = [message.author.id], usersArray = []
        if (isNaN(limit) || !limit || limit > 20) limit = 20
        else if (limit < 2) limit = 2

        let embed = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.default)
            .setTimestamp()

            .setTitle(`${config.money.emoji} **${config.text.separator}** Batalha`)
            .setDescription(`Uma nova batalha foi iniciada por **${message.author.tag}**!\nPara entrar nela são necessários **${value.toLocaleString('de-DE')} ${config.money.name}**. A batalha será finalizado após 60 segundos ou caso o criador clicar em "✅".`)

            .addFields([
                { name: `Prêmio`, value: `0 ${config.money.name}`, inline: true },
                { name: `Participantes \`(1/${limit})\``, value: `${message.author}`, inline: false }
            ])

        let msg = await message?.reply({ content: message.author.toString(), embeds: [embed] }), collector = msg?.createReactionCollector({ filter: (r, u) => u.id !== client.user.id, time: 60000 })
        msg?.react('🏹'), msg?.react('✅')

        collector.on('collect', async (r, u) => {
            if (r.emoji.name == '✅' && u.id === message.author.id) return collector.stop()
            if (r.emoji.name == '🏹' && u.id !== message.author.id) {

                try {
                    if (users.includes(u.id)) return
                    let intDoc = await database.get(u.id, 'User', 'money')
                    if (intDoc?.money >= value) users.push(u.id)
                    else return;

                    let embedEdit = msg.embeds[0].data
                    embedEdit.fields[0] = { name: `Prêmio`, value: `${(value * (users.length - 1)).toLocaleString('de-DE')} ${config.money.name}`, inline: true }
                    embedEdit.fields[1] = { name: `Participantes  \`(${users.length}/${limit})\``, value: `${users.map(u => `<@${u}>`).join('\n')}`, inline: false }

                    msg?.edit({ embeds: [embedEdit] })

                    if (users.length >= limit) return collector.stop()
                } catch (e) {
                    console.log(e)
                }

            }
        })

        collector.on('end', async () => {
            for (let i of users) {
                let checkDock = await database.get(i, 'User', 'money')
                if (checkDock?.money >= value) usersArray.push(i)
            }

            if (usersArray.length <= 1) return message.reply(`${config.emojis.error} ${config.text.separator} ${message.author}, não tinham participantes o suficiente nessa batalha, a mesma foi cancelada.`)
            else {
                let winner = usersArray[parseInt(Math.random() * usersArray.length)], finalValue = parseInt(value * (usersArray.length - 1))
                let tax = await client.function.tax(winner, finalValue)

                for (let i of usersArray) {
                    if (i === winner) {
                        database.add(winner, tax)
                        database.tr(winner, true, finalValue, `no duelo de \`${message.author.tag}\` \`(${message.author.id})\`.`)
                    } else {
                        database.sub(i, value)
                        database.tr(i, false, value, `no duelo de \`${message.author.tag}\` \`(${message.author.id})\`.`)
                    }
                }

                let embedEdit = msg.embeds[0].data
                embedEdit.fields[0] = { name: `Prêmio`, value: `${(value * (users.length - 1)).toLocaleString()} ${config.money.name}`, inline: true }
                embedEdit.fields[1] = { name: `Ganhador`, value: `<@${winner}>`, inline: true }
                embedEdit.fields[2] = { name: `Participantes  \`(${users.length}/${limit})\``, value: `${users.map(u => `<@${u}>`).join('\n')}`, inline: false }

                msg?.edit({ embeds: [embedEdit] })
                msg?.reply(`<@${winner}> ganhou **${tax == value ? value.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + ` \`(Taxa de ${(finalValue - tax).toLocaleString('de-DE')})\``} ${config.money.name}** na batalha de ${message.author} contra \`${usersArray.length - 1}\` outros participantes, os outros participantes perderam **${value.toLocaleString()} ${config.money.name}**.`)
            }
        })

    }
}