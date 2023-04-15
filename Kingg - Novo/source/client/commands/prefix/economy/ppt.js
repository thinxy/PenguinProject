const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: "ppt",
    aliases: ["rps", "pedrapapeltesoura"],
    desc: 'Chama um usuário para apostar em um clássico Pedra, Papel ou Tesoura.',
    uso: '<usuário> <valor>',
    cooldown: 2000,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, false)

        if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, mencione alguém para apostar.`)
        if (!args[1]) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me um valor para apostar`)

        let doc = await database.get(message.author.id, 'User', 'money ban'),
            docP = await database.get(user.id, 'User', 'money ban'),
            ban = await database.ban(user.id),
            amount = await client.function.number(args[1], doc.money, docP.money)

        if (isNaN(amount)) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, essa não é uma quantia válida, diga-me uma quantia válida para apostar!`)
        if (user.id == message.author.id) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode apostar consigo mesmo.`)
        if (amount < 100) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode apostar menos que **100** ${config.money.name}.`)
        if (amount > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode apostar mais do que tem.`)
        if (amount > docP.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, o usuário que foi chamado para a aposta não tem tantas ${config.money.name.toLowerCase()} assim.`)
        if (ban.is == true) return message?.reply(ban.msg)

        var playerChoice = undefined, opponentChoice = undefined

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("rock")
                    .setLabel("Pedra")
                    .setEmoji('🪨'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("paper")
                    .setLabel("Papel")
                    .setEmoji('📄'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("scissors")
                    .setLabel("Tesoura")
                    .setEmoji('✂️'),
            )

        let msg = await message?.reply(`${config.emojis.question} **${config.text.separator}** ${user}, o usuário ${message.author} deseja apostar **${amount.toLocaleString('de-DE')} ${config.money.name}** com você em um **pedra, papel ou tesoura**. Para aceitar a aposta os dois devem clicar na reação abaixo.`)
        msg?.react('✅')

        let filter = (r, u) => r.emoji.name === `✅` && u.id === user.id || u.id === message.author.id, collector = msg?.createReactionCollector({ filter: filter, time: 60000 })

        collector.on('collect', async () => {
            let reactions = msg.reactions.cache.get('✅').users.cache.filter(u => !u.bot && u.id).map(x => x.id)
            if (reactions.includes(user.id) && reactions.includes(message.author.id)) {

                let emb = new EmbedBuilder()

                    .setTitle(`${config.emojis.question} **${config.text.separator}** Pedra, Papel ou Tesoura?`)
                    .setFooter({ text: `Comando utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .addFields([
                        { name: message.author.tag, value: `Nada foi escolhido ainda, clique nos botões abaixo.`, inline: false },
                        { name: user.tag, value: `Nada foi escolhido ainda, clique nos botões abaixo.`, inline: false }
                    ])
                    .setDescription(`Essa aposta está valendo **${amount.toLocaleString('de-DE')} ${config.money.name}**.`)
                    .setColor(config.colors.default)
                    .setTimestamp()

                msg?.edit({ content: user.toString(), embeds: [emb], components: [btn] })
                msg?.reactions.removeAll().catch(() => { })

                collector.stop('success')

                let btnCollector = msg?.createMessageComponentCollector({
                    idle: 120000
                })

                btnCollector.on('collect', async (int) => {

                    if (int.user.id != message.author.id && int.user.id != user.id) return
                    await int.deferUpdate().catch(() => { })

                    doc = await database.get(message.author.id, 'User', 'money ban'), docP = await database.get(user.id, 'User', 'money ban')
                    if (amount > doc.money) return
                    if (amount > docP.dinheiro) return

                    if (int.customId == 'rock') {
                        int?.followUp({ content: `🪨 **${config.text.separator}** ${int.user}, você escolheu **Pedra**.`, ephemeral: true })
                    } else if (int.customId == 'paper') {
                        int?.followUp({ content: `📄 **${config.text.separator}** ${int.user}, você escolheu **Papel**.`, ephemeral: true })
                    } else {
                        int?.followUp({ content: `✂️ **${config.text.separator}** ${int.user}, você escolheu **Tesoura**.`, ephemeral: true })
                    }

                    if (int.user.id == message.author.id) {
                        playerChoice = int.customId
                    } else {
                        opponentChoice = int.customId
                    }

                    if (playerChoice && opponentChoice) btnCollector.stop()

                    emb = new EmbedBuilder()

                        .setTitle(`${config.emojis.question} **${config.text.separator}** Pedra, Papel ou Tesoura?`)
                        .setFooter({ text: `Comando utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                        .addFields([
                            { name: message.author.tag, value: `${playerChoice ? `${config.emojis.success} Pronto!` : `Nada foi escolhido ainda, clique nos botões abaixo.`}`, inline: false },
                            { name: user.tag, value: `${opponentChoice ? `${config.emojis.success} Pronto!` : `Nada foi escolhido ainda, clique nos botões abaixo.`}`, inline: false }
                        ])
                        .setDescription(`Essa aposta está valendo **${amount.toLocaleString('de-DE')} ${config.money.name}**.`)
                        .setColor(config.colors.default)
                        .setTimestamp()

                    if (playerChoice && opponentChoice) {
                        await msg?.edit({ content: user.toString(), embeds: [emb.setColor(config.colors.green)], components: [] }).catch(() => { })
                    } else {
                        msg?.edit({ content: user.toString(), embeds: [emb], components: [btn] })
                    }

                    let tax2 = await client.function.tax(user.id, amount), tax = await client.function.tax(message.author.id, amount)

                    if (playerChoice == 'rock' && opponentChoice == 'rock' || playerChoice == 'paper' && opponentChoice == 'paper' || playerChoice == 'scissors' && opponentChoice == 'scissors') {
                        await client.await(1000)

                        return message?.reply(`${config.emojis.question} **${config.text.separator}** ${message.author}, deu empate! As suas moedas e as de ${user} foram devolvidas, os dois escolheram **${playerChoice.replace('paper', '📄 Papel').replace('scissors', '✂️ Tesoura').replace('rock', '🪨 Pedra')}**.`)

                        return playerChoice = undefined, opponentChoice = undefined
                    } else if (playerChoice == 'paper' && opponentChoice == 'rock' || playerChoice == 'rock' && opponentChoice == 'scissors' || playerChoice == 'scissors' && opponentChoice == 'paper') {

                        database.sub(user.id, amount)
                        database.tr(user.id, false, amount, `apostando no "ppt" contra \`${message.author.tag}\` \`(${message.author.id})\`.`)
                        database.add(message.author.id, tax2)
                        database.tr(message.author.id, true, amount, `apostando no "ppt" contra \`${user.tag}\` \`(${user.id})\`.`)

                        message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, você ganhou! Parabéns, você ganhou **${tax == amount ? amount.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + ` \`(Taxa de ${(amount - tax).toLocaleString('de-DE')})\``} ${config.money.name}** patrocinadas por ${user}, você escolheu **${playerChoice.replace('paper', '📄 Papel').replace('scissors', '✂️ Tesoura').replace('rock', '🪨 Pedra')}** e seu oponente escolheu **${opponentChoice.replace('paper', '📄 Papel').replace('scissors', '✂️ Tesoura').replace('rock', '🪨 Pedra')}**.`)

                        return playerChoice = undefined, opponentChoice = undefined
                    } else if (playerChoice == 'rock' && opponentChoice == 'paper' || playerChoice == 'rock' && opponentChoice == 'scissors' || playerChoice == 'paper' && opponentChoice == 'scissors') {
                        await client.await(1000)

                        database.sub(message.author.id, amount)
                        database.tr(message.author.id, false, amount, `apostando no "ppt" contra \`${user.tag}\` \`(${user.id})\`.`)
                        database.add(user.id, tax)
                        database.tr(user.id, true, amount, `apostando no "ppt" contra \`${message.author.tag}\` \`(${message.author.id})\`.`)

                        message?.reply(`${config.emojis.success} **${config.text.separator}** ${user}, você ganhou! Parabéns, você ganhou **${tax2 == amount ? amount.toLocaleString('de-DE') : tax2.toLocaleString('de-DE') + ` \`(Taxa de ${(amount - tax2).toLocaleString('de-DE')})\``} ${config.money.name}** patrocinadas por ${message.author}, você escolheu **${opponentChoice.replace('paper', '📄 Papel').replace('scissors', '✂️ Tesoura').replace('rock', '🪨 Pedra')}** e seu oponente escolheu **${playerChoice.replace('paper', '📄 Papel').replace('scissors', '✂️ Tesoura').replace('rock', '🪨 Pedra')}**.`)

                        return playerChoice = undefined, opponentChoice = undefined
                    }
                })
            }
        })

    }
}