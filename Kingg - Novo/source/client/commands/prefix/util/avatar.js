const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: "avatar",
    aliases: ["av"],
    desc: 'Obtém o seu avatar ou o de um usuário em específico.',
    uso: '[usuário]',
    cooldown: 2000,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, true), avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 })

        const embed = new EmbedBuilder()

            .setTitle(`🖼️ **${config.text.separator}** Avatar de \`${user.tag}\``)
            .setImage(avatar)

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setColor(config.colors.invisible)
            .setDescription(`Clique [aqui](${avatar}) para baixar a imagem.`)

        message?.reply({ embeds: [embed] })

    }
}