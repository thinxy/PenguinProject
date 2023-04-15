const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'cooldowns',
    aliases: ['cooldown', 'cd', 'tempos'],
    description: 'Verifica os tempos de espera entre os comandos de um usuário.',
    uso: '[usuário]',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, true),
            doc = await database.get(user.id, 'User', '_id resources cooldowns'),
            prefix = await database.get(message.guild.id, 'Guild', 'config').then(x => x.config.prefix)

        const embed = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.green)
            .setTimestamp()

            .setTitle(`${config.emojis.waiting} **${config.text.separator}** Tempos de Espera`)
            .setDescription(`${message.author}, esses são os ${user.id == message.author.id ? `seus tempos de espera.` : `tempos de espera de \`${user.tag}\` \`(${user.id})\``}`)
            .addFields([
                { name: `Diário`, value: `${doc.cooldowns.daily < Date.now() ? `${config.emojis.success} Disponível.` : `\`${durationTime(doc.cooldowns.daily, { removeMs: true, displayAtMax: 2 })}\``}`, inline: true },
                { name: `Trabalho`, value: `${doc.cooldowns.work < Date.now() ? `${config.emojis.success} Disponível.` : `\`${durationTime(doc.cooldowns.work, { removeMs: true, displayAtMax: 2 })}\``}`, inline: true },
                { name: `Voto`, value: `${doc.cooldowns.upvote < Date.now() ? `${config.emojis.success} [Disponível](${config.links.upvote}).` : `\`${durationTime(doc.cooldowns.upvote, { removeMs: true, displayAtMax: 2 })}\``}`, inline: true },
                { name: `Reputação`, value: `${doc.cooldowns.rep < Date.now() ? `${config.emojis.success} Disponível.` : `\`${durationTime(doc.cooldowns.rep, { removeMs: true, displayAtMax: 2 })}\``}`, inline: true }
            ])

        message?.reply({ content: message.author.toString(), embeds: [embed] })
    }
}