const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: "banner",
    aliases: ["faixa"],
    desc: 'Obtém seu banner ou o de um usuário em específico.',
    uso: '[usuário]',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, true), banner = await client.users.fetch(user.id, { force: true }).then(x => x.bannerURL({ dynamic: true, size: 4096 }))

        if (banner != null) {

            const embed = new EmbedBuilder()

                .setTitle(`🖼️ **${config.text.separator}** Banner de \`${user.tag}\``)
                .setImage(banner)

                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setColor(config.colors.invisible)
                .setDescription(`Clique [aqui](${banner}) para baixar a imagem.`)

            message?.reply({ embeds: [embed], content: message.author.toString() })

        } else {
            message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, esse usuário não tem um banner.`)
        }

    }
}