const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector, AttachmentBuilder } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')
const { createCanvas, loadImage, registerFont } = require('canvas')
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji')

module.exports = {
    name: 'placar',
    aliases: ['top', 'leaderboard', 'pódio', 'rank', 'lb'],
    desc: 'Verifica um placar com os 10 usuários mais ricos.',
    uso: '',
    cooldown: 3000,
    run: async (client, message, args, config, database) => {

        let attachment, emb = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setColor(config.colors.default)

        if (['reps', 'reputacoes', 'reputações'].includes(args[0]?.toLowerCase())) {
            let sorted = await database.users.find({}, 'profile', { sort: { 'profile.data.reputations': -1 } }), sliced = sorted.slice(0, 10)
            let list = await Promise.all(sliced.map(async (i, x) => {
                let user = await client.users.fetch(i.id)
                return `**${x + 1}.** \`${user.tag.replaceAll('`', '')}\` - **${i.profile.data.reputations.toLocaleString('de-DE')}**`
            }))

            emb.setDescription(list.join('\n'))
            emb.setTitle(`⭐ **${config.text.separator}** Placar de Reputações (Global)`)
        } else {
            registerFont('./source/utils/fonts/coolvetica.ttf', { family: 'cool' })

            let page = parseInt(args[0])

            if (page) {
                if (page > 5) page = 0
                else if (page < 1) page = 0
                else page = parseInt((page - 1) * 5)
            } else page = 0
            if (isNaN(page)) page = 0

            let users = await database.users.find({}, 'money', { sort: { 'money': -1 } }).then(x => x.slice(page, page + 5))
            let image = createCanvas(480, 560), ctx = image.getContext("2d") //diminui essa resolução

            for (let i = 0; i < users.length; i++) {
                let y = 93 * i, x = 155
                let user = await client.users.fetch(users[i].id)

                ctx.save()
                let avatar = await loadImage(user.displayAvatarURL({ size: 2048, extension: 'png' }))
                ctx.drawImage(avatar, x - 100, y + 90, 86, 86);
                ctx.restore()
            }

            let layout = await loadImage('https://cdn.discordapp.com/attachments/1021068645025202207/1030635629157040178/1665793043378.png')
            ctx.drawImage(layout, 0, 0, image.width, image.height);
            let j = 0

            for (let i = 0; i < users.length; i++) {
                let y = 93 * i, x = 155, position = j++ * 90

                let user = await client.users.fetch(users[i].id)

                ctx.save()
                ctx.font = user.tag.length >= 15 ? '13px cool' : '22px cool';
                ctx.fillStyle = '#F8F8F8';
                await fillTextWithTwemoji(ctx, user.tag, x, y + 120)

                ctx.font = '21px cool';
                ctx.fillStyle = '#F8F8F8';
                await fillTextWithTwemoji(ctx, `#${String(i + (page + 1))}`, x + 254, y + 106)

                ctx.font = '10px cool';
                ctx.fillStyle = '#F8F8F8';
                await fillTextWithTwemoji(ctx, 'ID: ' + user.id, x, y + 134)

                ctx.font = '25px cool';
                ctx.fillStyle = '#F8F8F8';
                await fillTextWithTwemoji(ctx, users[i].money.toLocaleString('de-DE') + ' Libras', x, y + 160)
                ctx.restore()
            }

            attachment = new AttachmentBuilder(image.toBuffer(), 'leaderboard.png')
        }

        message?.reply({ embeds: ['reps', 'reputacoes', 'reputações'].includes(args[0]?.toLowerCase()) ? [emb] : [], content: message.author.toString(), files: !['reps', 'reputacoes', 'reputações'].includes(args[0]?.toLowerCase()) ? [attachment] : [] })

    }
}