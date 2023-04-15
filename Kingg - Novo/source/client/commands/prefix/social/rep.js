const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require("ms")

module.exports = {
    name: "rep",
    aliases: ["reputation", "reputacao", "reputação"],
    desc: 'Envia uma reputação para um usuário.',
    uso: '<usuário>',
    cooldown: 5000,
    run: async (client, message, args, config, database) => {

        const user = await client.function.find(args[0], client, message)
        if (!user || user.id === message.author.id) return reply(message, `${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me para quem você quer enviar uma reputação`)

        let docUser = await database.get(user.id, "User", "profile"), ban = await database.ban(user.id)
        let doc = await database.get(message.author.id, "User", "cooldowns profile"), time = durationTime(doc.cooldowns.rep, { displayAtMax: 3, removeMs: true }), next = Date.now() + 3600000
        if (doc.cooldowns.rep > Date.now()) return reply(message, `${config.emojis.waiting} **${config.text.separator}** ${message.author}, espere mais \`${time}\` para enviar uma reputação novamente.`)
        if (ban.is == true) return message?.reply(ban.msg)

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Ativar Lembrete')
                    .setCustomId(`remind-${message.author.id}-${next}-enviar_uma_reputação`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔔')
                    .setDisabled(false)
            )

        reply(message, {
            content: `${config.emojis.success} **${config.text.separator}** ${message.author}, reputação enviada com sucesso para ${user}!\nAgora ${user} possui **${docUser.profile.data.reputations + 1}** reputações!`,
            components: [btn]
        })

        let date = new Date()
        date.setHours(new Date().getHours() - 3)

        await database.users.updateOne({ _id: message.author.id }, {
            $set: { "cooldowns.rep": Date.now() + 3600000 },
            $push: { "actions.reputations": `\`[${date.toLocaleString('pt-br')}]\` **📤 |** Enviou **1 Reputação** para \`${user.tag}\` \`( ${user.id} )\`.` }
        })
        await database.users.updateOne({ _id: user.id }, {
            $push: { "actions.reputations": `\`[${date.toLocaleString('pt-br')}]\` **📥 |** Recebeu **1 Reputação** de \`${message.author.tag}\` \`( ${message.author.id} )\`.` },
            $inc: { "profile.data.reputations": 1 }
        })

        if (Math.random() * 100 < 25 && await database.vip(message.author.id) == true) {

            reply(message, {
                content: `${config.emojis.success} **${config.text.separator}** ${message.author}, você recebeu com sucesso uma reputação de ${client.user}!\nAgora você possui **${doc.profile.data.reputations + 1}** reputações!`
            })

            await database.users.updateOne({ _id: message.author.id }, {
                $push: { "actions.reputations": `\`[${date.toLocaleString('pt-br')}]\` **📥 |** Recebeu **1 Reputação** de \`${client.user.tag}\` \`( ${client.user.id} )\`.` },
                $inc: { "profile.data.reputations": 1 }
            })

        }
    }
}

function reply(msg, str) {
    return msg.reply(str).catch(() => msg.channel.send(str))
}