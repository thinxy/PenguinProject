const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks') // boboca

module.exports = {
    name: "vip",
    aliases: ['premium'],
    run: async (client, message, args, config, database) => {
        const vip = await database.vip(message.author.id)

        if (!['claim', 'resgatar'].includes(args[0]?.toLowerCase())) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Comprar (24.99 R$)")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://discord.com/users/799086286693597206")
                        .setEmoji('🛒')
                )

            const embed = new EmbedBuilder()
                .setTitle(`${config.money.emoji} **${config.text.separator}** Benefícios **VIP** - ` + client.user.username)
                .setDescription(`>>> Recompenas no servidor oficial - [Clique Aqui](${config.links.guild})
                Recompensa diária multiplicada - \`2x\`
                Chance de ter uma reputação devolvida aumentada - \`25%\`
                Taxa economica diminuida - \`0%\`
                ${config.money.name} por minuto - \`15\`
                Insígnia especial no perfil - \`Indisponível\`
                Limite de aposta no comando Vinte-e-Um aumentado - \`250.000\`
                Novo comando de coleta - \`vip resgatar\`
                `)
                .setColor(vip ? config.colors.green : config.colors.green)
                .setFooter({ text: `Utilizado por ${message.author.tag} `, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setColor(config.colors.default)

            if (vip) {
                let time = await database.get(message.author.id, "User", "util").then(x => x.util.premium)
                time = time === "perm" ? "Permanente" : `\`${durationTime(Number(time), { removeMs: true, displayAtMax: 3 })}\``
                embed.addFields([
                    {
                        name: "Tempo Restante:",
                        value: time
                    }
                ])
            }

            message.reply({
                content: message.author.toString(),
                embeds: [embed],
                components: [row]
            })
        } else {
            if (!vip) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não é um usuário **VIP** e por isso não pode usar esse comando!`)
            let doc = await database.get(message.author.id, "User", "cooldowns")
            if (doc.cooldowns.vip > Date.now()) return message?.reply(`${config.emojis.waiting} **${config.text.separator}** ${message.author}, volte em <t:${parseInt(doc.cooldowns.vip / 1000)}> \`(${durationTime(doc.cooldowns.vip, { removeMs: true, displayAtMax: 2 }) || 'alguns milissegundos'})\` para trabalhar novamente.`)

            const value = await client.function.random(12000, 5000, true)
            database.tr(message.author.id, true, value, 'na recompensa VIP.')

            await database.users.updateOne({ _id: message.author.id }, {
                $inc: { 'money': value },
                $set: { 'cooldowns.vip': Date.now() + 3600000 }
            })

            let btn = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Ativar Lembrete')
                        .setCustomId(`remind-${message.author.id}-${Date.now() + 3600000}-coletar_a_recompensa_vip`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🔔')
                        .setDisabled(false)
                )

            const embed = new EmbedBuilder()
                .setTitle(`${config.emojis.success} **${config.text.separator}** Recompensa **VIP**`)
                .setDescription(`${message.author}, você coletou **` + value.toLocaleString("de-DE") + " " + config.money.name + "**, volte em uma hora para coletar sua recompensa novamente.")
                .setFooter({ text: `Utilizado por ${message.author.tag} `, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setColor(config.colors.green)

            message.reply({
                content: message.author.toString(),
                embeds: [embed],
                components: [btn]
            })
        }
    }
}