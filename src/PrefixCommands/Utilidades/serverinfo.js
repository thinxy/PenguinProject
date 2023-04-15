import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } from "discord.js";
  import Command from "../../Structures/base/Command.js";
  
  export default class ServerInfoCommand extends Command {
    constructor(client) {
      super(client, {
        name: "serverinfo",
        description: "｢Utilidade｣veja as informações do servidor atual.",
        help: {
          usage: "{prefix}serverinfo",
        },
      });
    }
    async run(message) {
      let membros = message.guild.memberCount;
      let cargos = message.guild.roles.cache.size;
      let canais = message.guild.channels.cache.size;
      let entrou = message.guild.joinedTimestamp;
      let servidor = message.guild;
      let donoid = message.guild.ownerId;
      let emojis = message.guild.emojis.cache.size;
      let serverid = message.guild.id;
      let impulsos = message.guild.premiumSubscriptionCount;
      let data = message.guild.createdAt.toLocaleDateString("pt-br");
  
      let ryan = new EmbedBuilder()
        .setColor(this.client.config.color)
        .setThumbnail(
          message.guild.iconURL({ dinamyc: true, format: "png", size: 4096 })
        )
        .setTitle(`Informações do servidor: ${message.guild}`)
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
            value: `<t:${parseInt(message.guild.createdTimestamp / 1000)}>`,
            inline: true,
          },
          {
            name: `🚀 ${message.author.username} entrou em `,
            value: `<t:${parseInt(servidor.joinedTimestamp / 1000)}:F>`,
            inline: true,
          },
          {
            name: `👑 Dono`,
            value: `<@!${donoid}> \n\`\`${donoid}\`\``,
            inline: true,
          }
        );
  
      message.reply({ content: `${message.author}`, embeds: [ryan] });
    }
  }
  