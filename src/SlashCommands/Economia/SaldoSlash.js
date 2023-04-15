import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import ms from 'ms'

export default class SaldoSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "saldo",
      description: "｢Economia｣ veja o seu saldo ou o saldo de algum usuário.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "mencione o usuário que deseja ver o saldo.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      help: {
        usage: "/saldo [@user]",
      },
    });
  }
  async run(interaction, prefix) {
    const user = interaction.options.getUser("user") || interaction.user;

    if (user.id != interaction.user.id) {
      let userdb = await this.client.db.users.findOne({
        where: { id: user.id },
      });

      if (!userdb) {
        return interaction.editReply({
          content: `${this.client.emoji.error} **-** ${interaction.user}, o usuário mencionado não está registrado em minha database.`,
          ephemeral: true
      });
      }
    }

    const money = await this.client.db.users
      .findOne({ where: { id: user.id } })
      .then((data) => data.dataValues.money);

    let rank = await this.client.db.users.findAll({
      order: [["money", "DESC"]],
    });

    let position = parseInt(rank.findIndex((x) => x.id == user.id) + 1);

    if (position === 0) position = "999+";

    if (user.id === interaction.user.id) {
      
      interaction.editReply({
       content: `${this.client.emoji.coin} **-** ${
          interaction.user
        }, você possui **${money.toLocaleString(
          "en-US"
        )} Gelitos ( ${money.toLocaleString("pt-BR", {
          notation: "compact",
          maximumFractionDigits: 1,
        })} )** em sua carteira, você está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`
    });
    } else {
      interaction.editReply(
        `${this.client.emoji.coin} **-** ${interaction.user}, o usuário \`${
          user.tag
        }\` possui **${money.toLocaleString(
          "en-US"
        )} Gelitos ( ${money.toLocaleString("pt-BR", {
          notation: "compact",
          maximumFractionDigits: 1,
        })} )** em sua carteira, o usuário está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`
      );
    }
  }
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
    : Math.sign(num) * Math.abs(num);
}
