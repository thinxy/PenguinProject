import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";

export default class ServerInfoSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      description: "｢Utilidade｣veja as informações do servidor atual.",
      type: ApplicationCommandType.ChatInput,
      help: {
        usage: "/serverinfo",
      },
    });
  }
  async run(interaction) {
    let membros = interaction.guild.memberCount;
    let cargos = interaction.guild.roles.cache.size;
    let canais = interaction.guild.channels.cache.size;
    let entrou = interaction.guild.joinedTimestamp;
    let servidor = interaction.guild;
    let donoid = interaction.guild.ownerId;
    let emojis = interaction.guild.emojis.cache.size;
    let serverid = interaction.guild.id;
    let impulsos = interaction.guild.premiumSubscriptionCount;
    let data = interaction.guild.createdAt.toLocaleDateString("pt-br");

    let ryan = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setThumbnail(
        interaction.guild.iconURL({ dinamyc: true, format: "png", size: 4096 })
      )
      .setTitle(`Informações do servidor: ${interaction.guild}`)
      .addFields(
        {
          name: `🪪 Identidade`,
          value: `\`\`\`${serverid}\`\`\``,
          inline: true,
        },
        {
          name: `📌 Canais em geral:`,
          value: `📖 Canais: ${canais}\n✨ Cargos: ${cargos}`,
          inline: true,
        },
        {
          name: `👥 Usuarios`,
          value: `\`\`\`${membros} membros\`\`\``,
          inline: true,
        },
        {
          name: `🗓️ Servidor criado`,
          value: `<t:${parseInt(interaction.guild.createdTimestamp / 1000)}>`,
          inline: true,
        },
        {
          name: `🚀 ${interaction.user.username} entrou em `,
          value: `<t:${parseInt(servidor.joinedTimestamp / 1000)}:F>`,
          inline: true,
        },
        {
          name: `👑 Dono`,
          value: `<@!${donoid}> \n\`\`${donoid}\`\``,
          inline: true,
        }
      );

    interaction.editReply({ content: `${interaction.user}`, embeds: [ryan] });
  }
}
