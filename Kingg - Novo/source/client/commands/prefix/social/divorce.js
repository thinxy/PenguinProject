const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'divorcio',
    aliases: ['divorce', 'divórcio'],
    desc: 'Se divorcie do seu/sua amada utilizando esse comando.',
    uso: '',
    cooldown: 10000,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'profile'), user = await client.users.fetch(doc.profile.wedding.user), userd = await database.get(message.author.id, 'User', 'profile')

        if (doc.profile.wedding.is != true) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não está casado com nenhum usuário.`)

        let msg = await message?.reply(`${config.emojis.question} **${config.text.separator}** ${message.author}, você tem certeza que deseja se divorciar de \`${user.tag}\` \`(${user.id})\`? Clique em **"${config.emojis.success}"** para confirmar essa ação.`)
        msg?.react(config.emojis.success)

        const collector = msg?.createReactionCollector({
            time: 60000
        })

        collector.on('collect', async () => {

            let reactions = msg?.reactions.cache.get(config.emojis.success).users.cache.filter(u => !u.bot && u.id).map(x => x.id)

            if (reactions.includes(message.author.id)) {
                doc = await database.get(message.author.id, 'User', 'profile')
                if (doc.profile.wedding.is == false) return

                userd.profile.wedding.is = false, doc.profile.wedding.is = false
                await doc.save(), await userd.save()

                let btn = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Divórcio Efetuado!')
                            .setCustomId(`divorce-${message.author.id}-${user.id}`)
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🏹')
                            .setDisabled(true)
                    )

                await msg?.reactions.removeAll(), await msg?.edit({ components: [btn] })
                collector.stop()
            }
        })

    }
}