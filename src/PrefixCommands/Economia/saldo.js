import Command from "../../Structures/base/Command.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import ms from "ms";

export default class SaldoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "saldo",
      description: "｢Economia｣ veja o seu saldo ou o saldo de algum usuário.",
      aliases: ["gelitos", "atm", "bal", "carteira"],
      help: {
        usage: "{prefix}saldo [@user]",
      },
    });
  }
  async run(message, args, prefix) {
    const user =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;

    if (user.id != message.author.id) {
      let userdb = await this.client.db.users.findOne({
        where: { id: user.id },
      });

      if (!userdb) {
        return message.reply({
          content: `${this.client.emoji.error} **-** ${message.author}, o usuário mencionado não está registrado em minha database.`,
          ephemeral: true,
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

    if (user.id === message.author.id) {
      message.reply({
        content: `${this.client.emoji.coin} **-** ${
          message.author
        }, você possui **${money.toLocaleString(
          "en-US"
        )} Gelitos ( ${money.toLocaleString("pt-BR", {
          notation: "compact",
          maximumFractionDigits: 1,
        })} )** em sua carteira, você está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`,
      });
    } else {
      message.reply(
        `${this.client.emoji.coin} **-** ${message.author}, o usuário \`${
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
