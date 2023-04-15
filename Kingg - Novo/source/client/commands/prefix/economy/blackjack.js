const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'blackjack',
    aliases: ['bj', 'vinteeum', 'vinte-e-um', '21'],
    desc: 'Aposta contra o seu oponente (eu) em um vinte-e-um.',
    uso: '<value>',
    cooldown: 4000,
    run: async (client, message, args, config, database) => {
        let buttons = (stts) => [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Comprar")
                        .setEmoji("💸")
                        .setCustomId("buy")
                        .setDisabled(stts),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel("Passar a vez")
                        .setEmoji("🔰")
                        .setCustomId("pass")
                        .setDisabled(stts)
                )
        ]

        let doc = await database.get(message.author.id, 'User', 'money'), value = await client.function.number(args[0], doc.money), block = client.blackjack.get(message.author.id), limit = await database.vip(message.author.id) == true ? 250000 : 100000

        if (!value) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me quanto você deseja apostar.`)
        if (isNaN(value)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, o value precisa ser uma quantia númerica.`)
        if (value < 20 || value > limit) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, o valor da aposta precisa ser entre **20** e **100.000** ${config.money.name}.`)
        if (value > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem tantas ${config.money.name.toLowerCase()} para apostar.`)
        if (block?.isBlock == true) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você já tem um jogo ativo, termine-o antes de executar um novo.`)

        client.blackjack.set(message.author.id, { isBlock: true })

        var numCardsPulled = 0
        var gameOver = false

        var player = {
            cards: [],
            score: 0
        }
        var dealer = {
            cards: [],
            score: 0
        }

        function getCardsValue(a) {
            var cardArray = [],
                sum = 0,
                i = 0,
                dk = 10.5,
                doubleking = "QQ",
                aceCount = 0
            cardArray = a
            for (i; i < cardArray.length; i += 1) {
                if (cardArray[i].rank === "J" || cardArray[i].rank === "Q" || cardArray[i].rank === "K") {
                    sum += 10
                } else if (cardArray[i].rank === "A") {
                    sum += 11
                    aceCount += 1
                } else if (cardArray[i].rank === doubleking) {
                    sum += dk
                } else {
                    sum += cardArray[i].rank
                }
            }
            while (aceCount > 0 && sum > 21) {
                sum -= 10
                aceCount -= 1
            }
            return sum
        }

        var deck = {
            deckArray: [],
            initialize: function () {
                var suitArray, rankArray, s, r, n;
                suitArray = ["Paus", "Ouros", "Corações", "Espadas"]
                rankArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]
                n = 13
                for (s = 0; s < suitArray.length; s += 1) {
                    for (r = 0; r < rankArray.length; r += 1) {
                        this.deckArray[s * n + r] = {
                            rank: rankArray[r],
                            suit: suitArray[s]
                        }
                    }
                }
            },
            shuffle: function () {
                var temp, i, rnd;
                for (i = 0; i < this.deckArray.length; i += 1) {
                    rnd = Math.floor(Math.random() * this.deckArray.length)
                    temp = this.deckArray[i]
                    this.deckArray[i] = this.deckArray[rnd]
                    this.deckArray[rnd] = temp
                }
            }
        }

        deck.initialize()
        deck.shuffle()

        var msgEmbed = await message?.reply(`${config.money.emoji} **${config.text.separator}** ${message.author}, embaralhando cartas...`)

        async function bet(outcome) {

            let tax = await client.function.tax(message.author.id, value)
            if (outcome === "win") {
                database.add(message.author.id, tax)
                database.tr(message.author.id, true, value, 'apostando no vinte-e-um.')
                message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, você ganhou **${tax == value ? value.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + ` \`(Taxa de ${(value - tax).toLocaleString('de-DE')})\``} ${config.money.name}**.`)

                client.blackjack.set(message.author.id, { isBlock: false })
            }
            if (outcome === "lose") {
                database.sub(message.author.id, value)
                database.tr(message.author.id, false, value, 'apostando no vinte-e-um.')
                message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você perdeu **${value.toLocaleString('de-DE')} ${config.money.name}**.`)

                client.blackjack.set(message.author.id, { isBlock: false })
            }
        }

        function resetGame() {
            numCardsPulled = 0
            player.cards = []
            dealer.cards = []
            player.score = 0
            dealer.score = 0
            deck.initialize()
        }

        async function endMsg(title, msg, dealerC) {
            let cardsMsg = ""
            player.cards.forEach(function (card) {
                cardsMsg += " | " + card.rank.toString();
                if (card.suit == "Corações") cardsMsg += "♥"
                if (card.suit == "Ouros") cardsMsg += "♦"
                if (card.suit == "Espadas") cardsMsg += "♠"
                if (card.suit == "Paus") cardsMsg += "♣"
                cardsMsg
            });
            cardsMsg += " --> " + player.score.toString()

            let dealerMsg = ""
            if (!dealerC) {
                dealerMsg = dealer.cards[0].rank.toString();
                if (dealer.cards[0].suit == "Corações") dealerMsg += "♥"
                if (dealer.cards[0].suit == "Ouros") dealerMsg += "♦"
                if (dealer.cards[0].suit == "Espadas") dealerMsg += "♠"
                if (dealer.cards[0].suit == "Paus") dealerMsg += "♣"
                dealerMsg
            } else {
                dealerMsg = "";
                dealer.cards.forEach(function (card) {
                    dealerMsg += " | " + card.rank.toString()
                    if (card.suit == "Corações") dealerMsg += "♥ "
                    if (card.suit == "Ouros") dealerMsg += "♦"
                    if (card.suit == "Espadas") dealerMsg += "♠"
                    if (card.suit == "Paus") dealerMsg += "♣"
                    dealerMsg
                })
                dealerMsg += " --> " + dealer.score.toString()
            }

            const gambleEmbed = new EmbedBuilder()

                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setColor(config.colors.default)
                .setTimestamp()

                .setTitle(`${config.money.emoji} **${config.text.separator}** Mesa de Jogo `)
                .addFields([
                    { name: 'Suas Cartas', value: cardsMsg, inline: true },
                    { name: 'Cartas do Oponente', value: dealerMsg, inline: true },
                    { name: title, value: msg }
                ])

            msgEmbed?.edit({ content: message.author.toString(), embeds: [gambleEmbed], components: gameOver ? [] : buttons(false) })
        }

        async function endGame() {
            if (player.score === 21) {
                bet('win')
                gameOver = true
                await endMsg("Você ganhou!", `> Você tem 21 pontos e por isso ganhou automáticamente, você ganhou **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (player.score > 21) {
                bet('lose')
                gameOver = true
                await endMsg("Você perdeu!", `> Você passou dos 21 pontos e por isso perdeu, você perdeu **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (dealer.score === 21) {
                bet('lose')
                gameOver = true
                await endMsg("Você perdeu!", `> O seu oponente atingiu 21 pontos, você perdeu **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (dealer.score > 21) {
                bet('win')
                gameOver = true
                await endMsg("Você ganhou!", `> O seu oponente passou dos 21 pontos, você ganhou **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (dealer.score >= 17 && player.score > dealer.score && player.score < 21) {
                bet('win')
                gameOver = true
                await endMsg("Você ganhou!", `> Você ganhou a partida contra seu oponente por obter uma pontuação maior que a dele, você ganhou **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (dealer.score >= 17 && player.score < dealer.score && dealer.score < 21) {
                bet('lose');
                gameOver = true
                await endMsg("Você perdeu!", `> O seu oponente obteve uma pontuação maior que a sua e por isso ganhou, você perdeu **${value.toLocaleString('de-DE')} ${config.money.name}**.`, true)
                return
            }
            if (dealer.score >= 17 && player.score === dealer.score && dealer.score < 21) {
                gameOver = true
                await endMsg("Houve um Empate!", `> Você e o seu oponente empataram, suas **${value.toLocaleString('de-DE')} ${config.money.name}** foram devolvidas.`, true)
                client.blackjack.set(message.author.id, { isBlock: false })
                return
            }
            loop()
        }

        function dealerDraw() {

            dealer.cards.push(deck.deckArray[numCardsPulled])
            dealer.score = getCardsValue(dealer.cards)
            numCardsPulled += 1
        }

        function newGame() {
            hit()
            hit()
            dealerDraw()
            endGame()
        }

        function hit() {
            player.cards.push(deck.deckArray[numCardsPulled])
            player.score = getCardsValue(player.cards)

            numCardsPulled += 1
            if (numCardsPulled > 2) {
                endGame()
            }
        }

        function stand() {
            while (dealer.score < 17) {
                dealerDraw()
            }
            endGame()
        }

        newGame()
        async function loop() {
            if (gameOver) return

            endMsg("Como Jogar?", `> Use os botões abaixo para jogar: \`\`comprar\`\` para comprar e \`\`passar\`\` para passar a vez! Lembre-se, esse jogo está valendo **${value.toLocaleString('de-DE')} ${config.money.name}**.`, false)

            let collector = msgEmbed?.createMessageComponentCollector({
                filter: (x) => x.user.id === message.author.id,
                idle: 60000
            })

            collector.on("collect", async (int) => {
                await int.deferUpdate().catch(() => { })
                if (int.user.id !== message.author.id) return
                collector.stop('s')
                if (int.customId == 'buy') {
                    hit()
                    return
                } else if (int.customId === 'pass') {
                    stand()
                    return
                } else {
                    collector.stop()
                    return msg?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, seu jogo foi cancelado, suas **${value.toLocaleString('de-DE')} ${config.money.name}** foram devolvidas.`)
                }
            })

            collector.on("end", async (c, m) => {
                if (m != 's') {
                    await msgEmbed.edit({ components: [] }).catch(() => { })
                    stand()
                    client.blackjack.set(message.author.id, { isBlock: false })
                }
            })
        }
    }
}