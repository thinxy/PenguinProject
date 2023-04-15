const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: 'trabalhar',
    aliases: ['work', 'trabalho'],
    desc: 'Trabalhe e suba de nível para ganhar dezenas de recompensas.',
    uso: '',
    cooldown: 1500,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'money cooldowns system')
        if (doc.cooldowns.work > Date.now()) return message.reply(`${config.emojis.waiting} **${config.text.separator}** ${message.author}, volte em <t:${parseInt(doc.cooldowns.work / 1000)}> \`(${durationTime(doc.cooldowns.work, { removeMs: true, displayAtMax: 2 }) || 'alguns milissegundos'})\` para trabalhar novamente.`)

        let next = Date.now() + ms('2h'),
            xp = await client.function.random(7, 5, true),
            value = parseInt(await client.function.random(1500, 1000, true) * (doc.system.work.multi / 2))

        let btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Ativar Lembrete')
                    .setCustomId(`remind-${message.author.id}-${next}-trabalhar_novamente`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔔')
            )

        let emb = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.default)
            .setTimestamp()

            .setTitle(`${config.money.emoji} **${config.text.separator}** Trabalho Efetuado`)
            .setDescription(`${message.author}, parabéns, você completou seu trabalho com sucesso e nele você ganhou **${value.toLocaleString('de-DE')} ${config.money.name}** e **${xp} de Experiência**, volte em <t:${parseInt(next / 1000)}> trabalhar novamente!`)

            .addFields([
                { name: `Progresso - **${doc.system.work.multi}** \`[${doc.system.work.experience + xp}/${doc.system.work.required}]\``, value: `${await client.function.bar(doc.system.work.experience, doc.system.work.required, 10, '🟩', '⬜')}`, inline: false }
            ])

        var msg = await message?.reply({ content: message.author.toString(), embeds: [emb], components: [btn] })

        database.tr(message.author.id, true, value, 'trabalhando')
        database.add(message.author.id, value)
        await database.users.updateOne({ _id: message.author.id }, {
            $set: { 'cooldowns.work': next },
            $inc: { 'system.work.experience': xp }
        })

        if (doc.system.work.experience + xp > doc.system.work.required) {

            btn = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Ativar Lembrete')
                        .setCustomId(`remind-${message.author.id}-${next}-trabalhar_novamente`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🔔'),
                    new ButtonBuilder()
                        .setLabel('Subiu de Nível')
                        .setCustomId(`level-up-work-${message.author.id}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬆️')
                        .setDisabled(true)
                )

            msg?.edit({ components: [btn] })

            await database.users.updateOne({ _id: message.author.id }, {
                $set: { 'system.work.experience': 0 },
                $inc: { 'system.work.multi': 1 }
            })

        }

    }
}