const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'casar',
    aliases: ['marry'],
    desc: 'Convida alguém para fortalecer a relação com um casamento, ou obtém informações sobre o seu casamento.',
    uso: '[usuário]',
    cooldown: 7000,
    run: async (client, message, args, config, database) => {

        const doc = await database.get(message.author.id, 'User', 'profile')

        if (doc.profile.wedding.is == true) {

            let time = doc.profile.wedding.date, user = doc.profile.wedding.user
            user = await client.users.fetch(user)

            let emb = new EmbedBuilder()

                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setColor(config.colors.blue)
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))

                .setTitle(`💍 **${config.text.separator}** Casamento`)
                .setDescription(`${message.author}, você está casado, abaixo você pode ver as informações sobre o seu casamento.`)
                .addFields([
                    { name: `Casado com`, value: `\`${user.tag}\` \`(${user.id}\``, inline: true },
                    { name: `Casado há`, value: `\`${durationTime(doc.profile.wedding.date, { removeMs: true, displayAtMax: 3 })}\``, inline: true }
                ])

            message?.reply({ embeds: [emb] })

        } else {

            if (!args[0]) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, mencione alguém para casar.`)
            let user = await client.function.find(args[0], client, message, false)
            if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me um usuário válido com quem você deseja casar.`)

            const docP = await database.get(user.id, 'User', 'profile'), ban = await database.ban(user.id)

            if (docP.profile.wedding.is == true) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, o usuário mencionado já está casado com outro usuário.`)
            if (user.id == message.author.id) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode casar consigo mesmo.`)
            if (ban.is == true) return message?.reply(ban.msg)

            let msg = await message?.reply(`💍**${config.text.separator}** ${user}, o usuário ${message.author} lhe fez um pedido de casamento para firmar os laços da relação entre vocês dois, para aceitar esse pedido os dois devem clicar em "💍".`)
            msg.react('💍')

            const collector = msg?.createReactionCollector({
                filter: (r, u) => u.id !== client.user.id,
                time: 60000
            })

            collector.on('collect', async (r, u) => {
                const reactions = msg?.reactions.cache.get('💍').users.cache.filter(u => !u.bot && u.id).map(x => x.id)
                if (reactions.includes(user.id) && reactions.includes(message.author.id)) {

                    if (doc.profile.wedding.is == true || docP.profile.wedding.is == true) return;

                    doc.profile.wedding.is = true, doc.profile.wedding.user = user.id, doc.profile.wedding.date = Date.now()
                    docP.profile.wedding.is = true, docP.profile.wedding.user = message.author.id, docP.profile.wedding.date = Date.now()
                    await doc.save(), await docP.save()

                    let btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Pedido Aceito, Parabéns ao Casal')
                                .setCustomId(`marry-${message.author.id}-${user.id}`)
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('💍')
                                .setDisabled(true)
                        )

                    await msg?.reactions.removeAll(), await msg?.edit({ components: [btn] })
                    collector.stop()
                }
            })

        }
    }
}