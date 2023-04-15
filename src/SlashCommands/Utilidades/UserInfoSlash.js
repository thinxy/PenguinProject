import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";

export default class UserInfoSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "｢Utilidade｣veja as suas informações ou de alguem usuário.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "mencione o usuário que você deseja ver as informações.",
          type: ApplicationCommandOptionType.User,
        },
      ],
      help: {
        usage: "/userinfo [@user]",
      },
    });
  }
  async run(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const server = interaction.guild.members.cache.get(user.id);

    const row = new ActionRowBuilder();

    let but1 = new ButtonBuilder()
      .setLabel("Cargos")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(`<:cargo:1032636097034985552>`)
      .setCustomId("config");

    row.addComponents([but1]);

    let embed = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setFooter({
        text: `Comando Solicitado Por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        {
          name: `✏️ | Nome`,
          value: `\`${user.username}\``,
          inline: true,
        },
        {
          name: "✨ | Tag",
          value: `\`#${user.discriminator}\``,
          inline: true,
        },
        {
          name: "🪪 | ID",
          value: `\`${user.id}\``,
          inline: true,
        },
        {
          name: "🗓️ | Conta Criada",
          value: `<t:${Math.ceil(user.createdTimestamp / 1000)}>`,
        },
        {
          name: "🗓️ | Entrada no Servidor",
          value: `<t:${Math.ceil(server.joinedTimestamp / 1000)}:F>`,
        },
        {
          name: "🤖 | Bot:",
          value: `${user.bot ? "Sim" : "Não"}`,
          inline: true,
        },
        {
          name: `🚀 | Server Booster`,
          value: `${
            server.premiumSince
              ? `Desde <t:${Math.ceil(server.premiumSinceTimestamp / 1000)}>`
              : "Não"
          }`,
          inline: true,
        }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }));

    const embedbutt = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setTitle("Cargos")
      .setFooter({
        text: `Comando Solicitado Por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `${
          server.roles.cache
            .sort((a, b) => b.position - a.position)
            .filter((role) => role != interaction.guild.roles.everyone)
            .map((role) => role)
            .join(" ") || `Nenhum`
        }`
      );

    interaction
      .editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [row],
        fetchReply: true,
      })
      .then(async (msg) => {
        const filter = (user) => user;
        const collector = msg.createMessageComponentCollector({
          filter: filter,
          time: 100000,
        });

        collector.on("collect", (x) => {
          x.reply({
            content: `${interaction.user}`,
            embeds: [embedbutt],
            ephemeral: true,
          });
        });
      });
  }
}
