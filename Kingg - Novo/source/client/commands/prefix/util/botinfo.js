const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'botinfo',
    aliases: ['infobot', 'king', 'kingg', 'info'],
    desc: 'Obtém informações sobre o Kingg.',
    uso: '',
    cooldown: 2500,
    run: async (client, message, args, config, database) => {

        let prefix = await database.get(message.guild.id, 'Guild', 'config').then(x => x.config.prefix)

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
                    .setURL(config.links.guild)
            ), embed = new EmbedBuilder()

                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setColor(config.colors.default)
                .setTimestamp()
                .setThumbnail(client.user.displayAvatarURL())

                .addFields([
                    { name: 'Ajuda', value: `Meu prefixo nesse servidor é \`${prefix}\`, utilize o comando \`${prefix}ajuda\` para visualizar meus comandos.`, inline: false },
                    { name: 'Usuários', value: `${await database.users.find({}).then(x => x.length)}`, inline: true },
                    { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Canais', value: `${client.channels.cache.size}`, inline: true },
                    { name: 'Tempo de Criação', value: `<t:${parseInt(client.user.createdTimestamp / 1000)}> \`(${durationTime(client.user.createdTimestamp, { removeMs: true, displayAtMax: 2 })})\``, inline: false },
                    { name: 'Tempo Online', value: `<t:${parseInt(client.readyTimestamp / 1000)}> \`(${durationTime(client.readyTimestamp, { removeMs: true, displayAtMax: 2 }) || 'alguns milissegundos'})\``, inline: false }
                ])

                .setTitle(`${config.money.emoji} **${config.text.separator}** Kingg`)
                .setDescription(`${message.author}, olá eu sou o **${client.user.username}**, sou uma aplicação desenvolvida em **JavaScript** & **NodeJs** por \`${await client.users.fetch('799086286693597206').then(x => x.tag)}\` e estou hospedado na [SquareCloud](https://squarecloud.org/), abaixo estão algumas de minhas informações.`)

        message?.reply({ content: message.author.toString(), components: [btn], embeds: [embed] })
    }
}