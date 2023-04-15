const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'upvote',
    aliases: ['vote', 'votar'],
    desc: 'Obtém o link para votar no bot dentro da top.gg, você recebe algumas libras e um cargo temporario em meu servidor de suporte.',
    uso: '',
    cooldown: 3000,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'money cooldowns system')
        if (doc.cooldowns.upvote > Date.now()) return message.reply(`${config.emojis.waiting} **${config.text.separator}** ${message.author}, volte em <t:${parseInt(doc.cooldowns.upvote / 1000)}> \`(${durationTime(doc.cooldowns.upvote, { removeMs: true, displayAtMax: 2 }) || 'alguns milissegundos'})\` para votar novamente.`)

        const embed = new EmbedBuilder()


            .setThumbnail(client.user.avatarURL())
            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.default)
            .setTimestamp()

            .setTitle(`${config.money.emoji} **${config.text.separator}** Vote em Mim`)
            .setDescription(`${message.author}, você pode votar em mim clicando [aqui](${config.links.upvote}). Sabia que você pode receber até **10,000 Libras** ao votar em mim?`)

        message?.reply({ embeds: [embed], content: message.author.toString() })
    }
}