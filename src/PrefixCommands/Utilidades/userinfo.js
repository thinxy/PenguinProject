import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
} from "discord.js";
import Command from "../../Structures/base/Command.js";

export default class UserInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "｢Utilidade｣veja as suas informações ou de alguem usuário.",
      help: {
        usage: "{prefix}userinfo [@user]",
      },
    });
  }
  async run(message, args, prefix) {
    const user =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;
    const server = message.guild.members.cache.get(user.id);

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
        text: `Comando Solicitado Por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
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
        text: `Comando Solicitado Por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `${
          server.roles.cache
            .sort((a, b) => b.position - a.position)
            .filter((role) => role != message.guild.roles.everyone)
            .map((role) => role)
            .join(" ") || `Nenhum`
        }`
      );

    message
      .reply({
        content: `${message.author}`,
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
            content: `${message.author}`,
            embeds: [embedbutt],
            ephemeral: true,
          });
        });
      });
  }
}
