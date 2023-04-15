const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const abbrev = (num) => (num).toLocaleString('de-DE')

class Raspadinha {
    constructor() { }
    async start(client, message, args) {

        let prize = {
            '🪦': 250,
            '💡': 1000,
            '🪙': 2500,
            '💸': 10000,
            '👑': 25000,
            '💎': 50000
        }, emojis = Object.keys(prize)

        if (['info', 'ajuda', 'help'].includes(args[0]?.toLowerCase())) return info()

        let control = {
            accepted: false,
            ended: false,
            customIds: [],
            clicks: 0
        }, emojiDefault = '🔐', buttons = getButtons()

        const confirmBt = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Confirmar")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(client.config.emojis.success)
                .setCustomId('pay')
        )

        const docUser = await client.database.get(message.author.id, 'User', 'money profile ban')
        if (docUser?.money < 500) return message.reply(`${client.config.emojis.error} **${client.config.text.separator}** ${message.author}, você precisa de **500 ${client.config.money.name}** para poder comprar uma raspadinha.`)

        let msg = await message.reply({
            content: `${client.config.emojis.question} **${client.config.text.separator}** ${message.author}, para poder apostar na raspadinha você antes deve pagar uma taxa de **500 ${client.config.money.name}**! Para confirmar esta ação basta clicar no botão abaixo.`,
            components: [confirmBt]
        })

        const collector = msg?.createMessageComponentCollector({
            filter: (i) => i.customId === 'pay' && i.user.id === message.author.id,
            idle: 60000
        })

        collector.on('collect', async (int) => {
            if (int.customId === 'pay') {
                await int.deferUpdate().catch(() => null)
                if (int.user.id !== message.author.id) return;
                control.accepted = true
                client.database.sub(message.author.id, 500)
                await msg?.delete().catch(() => { })
                client.database.tr(message.author.id, false, 500, 'para comprar uma raspadinha')
                return startRaspadinha()
            }
        })

        collector.on('end', () => {
            if (control.accepted) return
            return msg?.edit({ components: [] }).catch(() => { })
        })

        async function startRaspadinha() {

            let emb = new EmbedBuilder()

                .setColor(client.config.colors.default)
                .addFields([
                    { name: `🪦`, value: `**${abbrev(prize[`🪦`])}** ${client.config.money.name}`, inline: true },
                    { name: `💡`, value: `**${abbrev(prize[`💡`])}** ${client.config.money.name}`, inline: true },
                    { name: `🪙`, value: `**${abbrev(prize[`🪙`])}** ${client.config.money.name}`, inline: true },
                    { name: `💸`, value: `**${abbrev(prize[`💸`])}** ${client.config.money.name}`, inline: true },
                    { name: `👑`, value: `**${abbrev(prize[`👑`])}** ${client.config.money.name}`, inline: true },
                    { name: `💎`, value: `**${abbrev(prize[`💎`])}** ${client.config.money.name}`, inline: true },
                ])

            msg = await message.reply({
                content: `${client.config.emojis.piece} **${client.config.text.separator}** ${message.author}, confira abaixo a lista com os emojis e suas premiações! \`(Para revelar os emojis basta clicar nos botões abaixo e boa sorte!)\``,
                components: buttons,
                embeds: [emb]
            })

            return msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                idle: 30000
            })
                .on('collect', async interaction => {
                    await interaction.deferUpdate().catch(() => { })

                    let customId = interaction.customId,
                        buttonIndex = { a1: 0, a2: 0, a3: 0, b1: 1, b2: 1, b3: 1, c1: 2, c2: 2, c3: 2 }[`${customId}`]

                    if (control.customIds.includes(customId)) return

                    control.customIds.push(customId)

                    control.clicks++
                    let buttom = buttons[buttonIndex].components.find(data => data.custom_id === customId)

                    buttom.emoji = getRandomEmoji()
                    buttom.disabled = true
                    buttom.style = '1'
                    await checkButtons()

                    return msg.edit({ components: buttons }).catch((e) => console.log(e))
                })
                .on('end', () => {

                    if (control.ended) return;
                    // else msg?.edit({ content: `${client.config.emojis.error} **${client.config.text.separator}** ${message.author}, o tempo acabou, se quiser jogar na raspadinha use o comando novamente.` })
                })
        }

        function getRandomEmoji() {
            return emojis[Math.floor(Math.random() * emojis.length)]
        }

        function checkButtons() {

            let a1 = buttons[0].components[0],
                a2 = buttons[0].components[1],
                a3 = buttons[0].components[2],
                b1 = buttons[1].components[0],
                b2 = buttons[1].components[1],
                b3 = buttons[1].components[2],
                c1 = buttons[2].components[0],
                c2 = buttons[2].components[1],
                c3 = buttons[2].components[2]

            const matches = [
                [a1, a2, a3], [b1, b2, b3], [c1, c2, c3],
                [a3, b3, c3], [a2, b2, c2], [a1, b1, c1],
                [a1, b2, c3], [a3, b2, c1]
            ]

            for (let condicional of matches)
                if (condicional.every(data => data.emoji === condicional[0].emoji && data.emoji !== emojiDefault)) {
                    for (let i of condicional) i.style = 3

                    dsbBtns([a1, a2, a3, b1, b2, b3, c1, c2, c3])
                    return win(condicional[0].emoji)
                }
                else continue

            if (control.clicks >= 9) {
                dsbBtns([a1, a2, a3, b1, b2, b3, c1, c2, c3])
            }

            return;
        }

        function win(emoji) {
            control.ended = true
            collector.stop()

            let amount = prize[emoji]

            if (amount > 0) {
                if (control.added) return;
                control.added = true
                client.database.add(message.author.id, amount)
                client.database.tr(message.author.id, true, amount, 'em uma raspadinha')
            }

            let msgFinal = `${client.config.emojis.success} **${client.config.text.separator}** ${message.author}, você ganhou **${abbrev(amount)} ${client.config.money.name}** no emoji ${emoji}.`

            return msg?.edit({
                content: msgFinal,
                components: buttons
            }).catch(() => { })
        }

        function dsbBtns(arr) {
            for (let button of arr)
                if (!button.disabled)
                    button.disabled = true
                else {
                    continue
                }
            return;
        }

        async function info() {
            const emb = new EmbedBuilder()
                .setTitle(`${client.config.emojis.question} **${client.config.text.separator}** Ajuda na Raspadinha`)
                .setColor(client.config.colors.default)
            sendreply
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()

                .addFields([
                    {
                        name: "Como jogar?",
                        value: `Para jogar você deve primeiramente pagar uma taxa de **500 ${client.config.money.name}**, logo após isso, você poderá clicar nos botões para ver seu resultado!`
                    },
                    {
                        name: "Como funciona?",
                        value: `Você pode ganhar acertando três emojis, seja eles na horizontal, vertical ou diagonal!`
                    },
                    {
                        name: "Premiações dos emojis",
                        value: `Cada emoji possui um valor diferente de recompensa, confira eles logo abaixo:\n** **`
                    }
                ])

                .addFields([
                    { name: `🪦`, value: `**${abbrev(prize[`🪦`])}** ${client.config.money.name}`, inline: true },
                    { name: `💡`, value: `**${abbrev(prize[`💡`])}** ${client.config.money.name}`, inline: true },
                    { name: `🪙`, value: `**${abbrev(prize[`🪙`])}** ${client.config.money.name}`, inline: true },
                    { name: `💸`, value: `**${abbrev(prize[`💸`])}** ${client.config.money.name}`, inline: true },
                    { name: `👑`, value: `**${abbrev(prize[`👑`])}** ${client.config.money.name}`, inline: true },
                    { name: `💎`, value: `**${abbrev(prize[`💎`])}** ${client.config.money.name}`, inline: true },
                ])
            message.reply({ content: message.author.toString(), embeds: [emb] })
        }

        function getButtons() {
            return [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a1',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a2',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'a3',
                            style: '2'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b1',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b2',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'b3',
                            style: '2'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c1',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c2',
                            style: '2'
                        },
                        {
                            type: 2,
                            emoji: emojiDefault,
                            custom_id: 'c3',
                            style: '2'
                        }
                    ]
                }
            ]
        }

    }

}

module.exports = Raspadinha