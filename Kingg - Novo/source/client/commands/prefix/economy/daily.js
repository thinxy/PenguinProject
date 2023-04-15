const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const moment = require('moment')

module.exports = {
    name: 'daily',
    aliases: ['resgatar', 'recompensa', 'diario'],
    description: 'Coleta sua recompensa diária, sua recompensa está disponível todos os duas após a meia-noite.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', '_id money cooldowns'), next = new Date(moment().add(1, 'days').format('L')).getTime(), vip = await database.vip(message.author.id)
        let value = vip == true ? await client.function.random(6000, 2500, true) * 2 : await client.function.random(6000, 2500, true)

        if (doc.cooldowns.daily > Date.now()) return message.reply(`${config.emojis.waiting} **${config.text.separator}** ${message.author}, volte em <t:${parseInt(doc.cooldowns.daily / 1000)}> \`(${durationTime(doc.cooldowns.daily, { removeMs: true, displayAtMax: 2 }) || 'alguns milissegundos'})\` para coletar sua recompensa novamente.`)

        await database.users.updateOne({ _id: message.author.id }, {
            $inc: { 'money': value },
            $set: { 'cooldowns.daily': next + 10800000 }
        })
        database.tr(message.author.id, true, value, 'na recompensa diária.')

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Ativar Lembrete')
                    .setCustomId(`remind-${message.author.id}-${next + 10800000}-coletar_a_recompensa_diária`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔔')
                    .setDisabled(false)
            )

        let emb = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.default)
            .setTimestamp()

            .setTitle(`${config.money.emoji} **${config.text.separator}** Recompensa Coletada`)
            .setDescription(`${message.author}, sua recompensa diária foi coletada e nela você ganhou **${value.toLocaleString('de-DE')} ${config.money.name}**, volte em <t:${parseInt((next + 10800000) / 1000)}> para coletar sua recompensa novamente!`)

        var msg = await message?.reply({ content: `${message.author} `, embeds: [emb], components: [btn] })
    }
}