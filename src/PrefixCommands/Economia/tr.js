import Command from "../../Structures/base/Command.js";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

export default class TransactionCommand extends Command {
  constructor(client) {
    super(client, {
      name: "tr",
      description: "「Economia」veja suas transações ou de algum usuário.",
      help: {
        usage: "{prefix}tr [@user]",
      },
    });
  }
  async run(message, args, prefix) {
    const USER =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;

    let userdb = await this.client.db.users.findOne({
      where: { id: USER.id },
    });

    if (!userdb) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, o usuário mencionado não está registrado em minha database.`,
        ephemeral: true,
      });
    }

    let transferencia = userdb.dataValues.tr;
    //|| "Cri Cri Cri, não encontrei nada aqui.";

    if (!transferencia) transferencia = [];

    if (!transferencia.length)
      return message.reply(
        `${this.client.emoji.error} **-** ${message.author}, Não encontrei nenhuma transferência em minha database.`
      );

    const maxPerPage = 10;
    const pages = Math.ceil(transferencia.length / maxPerPage);
    let page = 0;

    let transferencias = transferencia
      .slice(page * maxPerPage, page * maxPerPage + maxPerPage)
      .map((e) => `${e}`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("volta")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("vai")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
    );

    if (transferencia.length <= 10) {
      row.components[1].setDisabled(true);
    }

    if (page <= 0) {
      row.components[0].setDisabled(true);
    }

    let mostrar = new EmbedBuilder()
      .setAuthor({
        iconURL: USER.displayAvatarURL({ dynamic: true }),
        name: `${USER.username} - Transações [${page + 1}/${pages}]`,
      })
      .setDescription(`${transferencias.join("\n")}`)
      .setThumbnail(USER.displayAvatarURL({ dynamic: true }))
      .setColor(this.client.config.color);

    let msg = await message.reply({
      embeds: [mostrar],
      components: [row],
      fetchReply: true,
    });

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };
    const collector = await msg.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (x) => {
      await x.deferUpdate();

      switch (x.customId) {
        case "volta":
          if (x.user.id !== message.author.id) return;
          page = page - 1;
          row.components[0].setDisabled(page <= 0 ? true : false);
          row.components[1].setDisabled(page >= pages - 1 ? true : false);

          if (page < pages - 1) {
            mostrar.setAuthor({
              iconURL: USER.displayAvatarURL({ dynamic: true }),
              name: `${USER.username} - Transações [${page + 1}/${pages}]`,
            });
            mostrar.setDescription(
              `${transferencia
                .slice(page * maxPerPage, page * maxPerPage + maxPerPage)
                .map((t) => `${t}`)
                .join("\n")}`
            );

            msg.edit({
              embeds: [mostrar],
              components: [row],
              fetchReply: true,
            });
          }
          break;
        case "vai":
          if (x.user.id !== message.author.id) return;
          page = page = 1;
          row.components[0].setDisabled(page <= 0 ? true : false);
          row.components[1].setDisabled(page >= pages - 1 ? true : false);

          if (page !== 0) {
            mostrar.setAuthor({
              iconURL: USER.displayAvatarURL({ dynamic: true }),
              name: `${USER.username} - Transações [${page + 1}/${pages}]`,
            });
            mostrar.setDescription(
              `${transferencia
                .slice(page * maxPerPage, page * maxPerPage + maxPerPage)
                .map((t) => `${t}`)
                .join("\n")}`
            );

            msg.edit({
              embeds: [mostrar],
              components: [row],
              fetchReply: true,
            });
          }
      }
    });
  }
}
