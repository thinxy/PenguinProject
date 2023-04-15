const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'reputações',
    aliases: ['reps', 'reputations'],
    desc: 'Verifica as ultimas 1.000 reputações de um usuário.',
    uso: '[usuário]',
    cooldown: 1500,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, true), doc = await database.get(user.id, 'User', 'actions money'), page = args[0]
        if (user || user.id == message.author.id) page = args[0]

        if (!page || isNaN(page) || page < 1 || page > 100) page = 1
        page = parseInt(page)
        let data = doc.actions.reputations.reverse()

        let max = page * 10, limit = data.length > 10 ? data.slice(max - 10, max) : data.slice(0, data.length), transactions = limit.join('\n')
        let sprox = false, svolt = true

        if (data.slice(max - 10, max).length < 10 || page * 10 == data.length) sprox = true
        if (page > 1) svolt = false

        const embed = (transactions) => new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.red)
            .setTimestamp()

            .setTitle(`${config.money.emoji} **${config.text.separator}** Reputações de \`${user.tag}\` (${page}/${parseInt((data.length / 10) + 1)})`)
            .setDescription(transactions)

        let bprox = (status) => new ButtonBuilder()
            .setCustomId('prox')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(status),
            bvolt = (status) => new ButtonBuilder()
                .setCustomId('volt')
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(status)

        const buttons = (s1, s2) => new ActionRowBuilder().addComponents(bvolt(s1), bprox(s2))

        let msg = await message?.reply({ content: message.author.toString(), embeds: [embed(`${transactions ? transactions : `Nenhuma reputação foi enviada ou recebida...`}`)], components: [buttons(svolt, sprox)] })
        let filter = i => i.user.id == message.author.id, collector = msg?.createMessageComponentCollector({ filter, time: 300000 })

        collector.on('collect', async (i) => {

            await i.deferUpdate().catch(e => { })

            if (i.customId == 'prox') {
                page = page + 1, max = page * 10
                if (page > 1) svolt = false
                if (page == 100 || max >= data.length) sprox = true
                limit = data.slice(max - 10, max).length >= 10 ? data.slice(max - 10, max) : data.slice(max - 10, max), trs = limit.join('\n')
            }

            if (i.customId == 'volt') {
                sprox = false, page = page - 1, max = page * 10
                if (page == 1) svolt = true
                if (page < 1) return
                limit = data.slice(max - 10, max), trs = limit.join('\n')
            }

            msg?.edit({ content: `${message.author}`, embeds: [embed(`${trs}`)], components: [buttons(svolt, sprox)] })
        })

    }
}