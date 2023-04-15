const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'convite',
    aliases: ['invite'],
    desc: 'Obtém o link de convite do bot para que você consiga adiciona-lo ao seu servidor.',
    uso: '',
    cooldown: 1500,
    run: async (client, message, args, config, database) => {

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Convite')
                    .setEmoji('📨')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.invite),
                new ButtonBuilder()
                    .setLabel('Servidor')
                    .setEmoji('👑')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.guild),
                new ButtonBuilder()
                    .setLabel('Vote em Mim')
                    .setEmoji('⭐')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.upvote)
            )


        message?.reply({ content: `${message.author}, clique nos botões abaixo para ser redirecionado aos links de convite.`, components: [btn] })
    }
}