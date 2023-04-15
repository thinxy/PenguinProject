const { InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { durationTime } = require('util-stunks')
const { emojis: e, text: t, colors: c } = require('../../utils/json/config.json')

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (client, interaction) => {
        if (interaction.type === InteractionType.MessageComponent) {
            if (interaction.customId.startsWith('remind-')) {
                let arr = interaction.customId.split("-"),
                    btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Lembrete Ativado')
                                .setCustomId(`remind-allowed`)
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('🔔')
                                .setDisabled(true)
                        )

                if (arr[1] != interaction.user.id) return;
                if (arr[2] < Date.now()) return;

                await interaction.message?.edit({ components: [btn] })
                    .catch(() => { })

                interaction.reply({
                    content: `${e.success} **${t.separator}** ${interaction.user}, seu lembrete foi definido para \`${durationTime(Number(arr[2]), { removeMs: true, displayAtMax: 2 })}\` com a mensagem \`${arr[3].replaceAll('_', ' ')}\`, quando esse tempo passar eu irei te avisar!`,
                    ephemeral: true
                })

                client.database.reminder(interaction.user.id, arr[3].replaceAll('_', ' '), interaction.message, Date.now(), arr[2])
            }
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            if (interaction.customId === 'edit-profile') {
                const response = interaction.fields.getTextInputValue('aboutme-change')

                await client.database.users.updateOne({ _id: interaction.user.id }, {
                    $set: { 'profile.config.aboutme': response }
                })

                interaction.reply({ content: `${e.success} **${t.separator}** ${interaction.user} pronto! O seu "sobre mim" foi definido como: \`\`\`\n${response}\`\`\``, ephemeral: true })
            }
        }

        if (interaction.type === InteractionType.MessageComponent) {
            let arr = interaction.customId.split("-")
            if (arr[1] != interaction.user.id) return;

            if (interaction.customId.includes("aboutme")) {
                const modal = new ModalBuilder()
                    .setCustomId('edit-profile')
                    .setTitle('Sobre Mim')
                    .addComponents([
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('aboutme-change')
                                .setLabel('Digite Aqui')
                                .setStyle(TextInputStyle.Paragraph)
                                .setMinLength(5)
                                .setMaxLength(200)
                                .setPlaceholder('Meu sobre mim é legal!')
                                .setRequired(true),
                        ),
                    ])

                await interaction.showModal(modal)
            }
        }

    }
}