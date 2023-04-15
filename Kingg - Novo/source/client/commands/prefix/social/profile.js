const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector, AttachmentBuilder } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require("ms")

const { createCanvas, loadImage, registerFont } = require('canvas')
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji')
const data = require('../../../../utils/json/resources.json')

module.exports = {
    name: "perfil",
    aliases: ["profile", "pr"],
    desc: 'Verifica o seu perfil atual ou o de um usuário.',
    uso: '[usuário]',
    cooldown: 7000,
    run: async (client, message, args, config, database) => {
        registerFont('./source/utils/fonts/coolvetica.ttf', { family: 'cool' })

        let position, user = await client.function.find(args[0], client, message, true)
        let image = createCanvas(1200, 900), ctx = image.getContext("2d"), doc = await database.get(user.id, 'User', 'money profile utils cooldowns ban')

        if (doc.ban.is == true) {
            let Time = new Date(doc.ban.date)
            return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, ${user} está banido de usar meus comandos por violar meus termos!\n**Razão**: \`${doc.ban.reason}\`\n**Data**: \`${Time.toLocaleString('pt-br')}\` \`(${durationTime(doc.ban.date, { removeMs: true, displayAtMax: 2 })})\``)
        }

        // BOTÃO

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Sobre Mim')
                    .setCustomId(`aboutme-${message.author.id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📃')
                    .setDisabled(false)
            )

        // LAYOUTS

        if (['lyid-default'.includes(doc.profile.config.layout)]) {
            position = {
                username: { font: ' 40px cool', color: '#F8F8F8', x: 310, y: 112 },
                badges: { font: ' 40px cool', color: '#F8F8F8', x: 5, y: 685 },
                aboutme: { font: '28px cool', color: '#F8F8F8', x: 7, y: 715 },
                avatar: { size: 225, x: 63, y: 45 },
                begin: { size: 105, x: 177, y: 157 },
                resources: { font: '39px cool', color: '#F8F8F8', x: 820, y: 770 },
                wedding: { font: '20px cool', color: '#F8F8F8', x: 310, y: 140 },
            }
        }

        // BACKGROUND

        ctx.drawImage(await loadImage(data.shop.items.backgrounds[doc.profile.config.background].url), 0, 0, image.width, image.height);

        // LAYOUT

        ctx.drawImage(await loadImage(data.shop.items.layouts[doc.profile.config.layout].url), 0, 0, image.width, image.height);

        // TEXT

        let username = user.username.trim().length > 15 ? user.username.trim().slice(0, 12) + '...' : user.username
        let avatar = await loadImage(user.displayAvatarURL({ size: 2048, extension: 'png' }))
        let rmoney = await database.users.find({ 'money': { $gt: 0 } }, 'money', { sort: { 'money': -1 } }), pmoney = parseInt(rmoney.findIndex(x => x.id === user.id) + 1)
        let rrep = await database.users.find({ 'profile.data.reputations': { $gt: 0 } }, 'profile', { sort: { 'profile.data.reputations': -1 } }), prep = parseInt(rrep.findIndex(x => x.id === user.id) + 1)

        ctx.font = position.username.font;
        ctx.fillStyle = position.username.color;
        await fillTextWithTwemoji(ctx, username, position.username.x, position.username.y);

        ctx.font = position.badges.font;
        await fillTextWithTwemoji(ctx, doc.profile.data.badges.map(x => data.shop.items.badges[x].view).join(""), position.badges.x, position.badges.y);

        ctx.font = position.aboutme.font;
        await fillTextWithTwemoji(ctx, doc.profile.config.aboutme.match(/.{1,44}/g).join("\n"), position.aboutme.x, position.aboutme.y);

        ctx.font = position.resources.font;
        await fillTextWithTwemoji(ctx, doc.money.toLocaleString('de-DE') + ' Libras', position.resources.x, position.resources.y);

        ctx.font = position.resources.font;
        await fillTextWithTwemoji(ctx, '#' + pmoney, position.resources.x + 291, position.resources.y - 27);

        ctx.font = position.resources.font;
        await fillTextWithTwemoji(ctx, doc.profile.data.reputations.toLocaleString('de-DE') + ' Reputações', position.resources.x, position.resources.y + 92);

        ctx.font = position.resources.font;
        await fillTextWithTwemoji(ctx, '#' + prep, position.resources.x + 291, position.resources.y + 92 - 21);

        // WEDDING

        if (doc.profile.wedding.is == true) {
            let muser = await client.users.fetch(doc.profile.wedding.user)

            ctx.font = position.wedding.font;
            await fillTextWithTwemoji(ctx, 'Casado(a) com: ' + muser.tag, position.wedding.x, position.wedding.y);
            await fillTextWithTwemoji(ctx, 'Casado(a) há: ' + durationTime(doc.profile.wedding.date, { removeMs: true, displayAtMax: 2 }), position.wedding.x, position.wedding.y + 30);
        }

        // AVATAR 

        ctx.beginPath();
        ctx.arc(position.begin.x, position.begin.y, position.begin.size, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, position.avatar.x, position.avatar.y, position.avatar.size, position.avatar.size);

        let attachment = new AttachmentBuilder(image.toBuffer(), 'profile.png')
        let msg = await message?.reply({ content: message.author.toString(), files: [attachment], components: [btn] })
    }
}