import Command from "../../Structures/base/Command.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";

export default class BitcoinsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bitcoins",
      description: "「Economia」veja o status ou seu saldo atual de bitcoins.",
      help: {
        usage: "{prefix}bitcoins <saldo | status>",
      },
    });
  }
  async run(message, args, prefix) {
    let arg = args[0];
    if (!arg)
      return message.reply(
        `${this.client.emoji.error} **-** ${message.author}, você não colocou se você deseja ver saldo ou o status do bitcoin.`
      );

    switch (arg) {
      case "saldo": {
        const user =
          message.mentions.users.first() ||
          this.client.users.cache.get(args[1]) ||
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
          .then((data) => data.dataValues.bitcoins);

        let rank = await this.client.db.users.findAll({
          order: [["bitcoins", "DESC"]],
        });

        let position = parseInt(rank.findIndex((x) => x.id == user.id) + 1);

        if (position === 0) position = "999+";

        if (user.id === message.author.id) {
          message.reply(
            `${this.client.emoji.coin} **-** ${
              message.author
            }, você possui **${money.toLocaleString(
              "en-US"
            )} Bitcoins ( ${money.toLocaleString("pt-BR", {
              notation: "compact",
              maximumFractionDigits: 1,
            })} )** em sua carteira, você está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`
          );
        } else {
          message.reply(
            `${this.client.emoji.coin} **-** ${message.author}, o usuário \`${
              user.tag
            }\` possui **${money.toLocaleString(
              "en-US"
            )} Bitcoins ( ${money.toLocaleString("pt-BR", {
              notation: "compact",
              maximumFractionDigits: 1,
            })} )** em sua carteira, o usuário está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`
          );
        }
        break;
      }
      case "status": {
        const cotacao = 100;
        const bitcoin = await this.client.db.users
          .findOne({
            where: { id: this.client.user.id },
          })
          .then((data) => data.dataValues.bitcoinValue);

        const bitcoinTime = await this.client.db.users
          .findOne({
            where: { id: this.client.user.id },
          })
          .then((data) => data.dataValues.bitcoinTime);

        const calc = bitcoinTime - Date.now();

        const data = ~~((Date.now() + calc) / 1000);

        const embed = new EmbedBuilder()
          .setColor(this.client.config.color)
          .setTitle("Status Bitcoins")
          .addFields(
            {
              name: "Cotação de Gelitos:",
              value: `**1 Bitcoins** => \`${bitcoin.toLocaleString(
                "en-US"
              )} Gelito\``,
            },
            {
              name: "Taxa da mineradora:",
              value: "`10%`",
            },
            {
              name: "Valor atualiza em:",
              value: `<t:${data}:R>`,
            }
          );

        await message.reply({
          content: `${message.author}`,
          embeds: [embed],
        });
      }
    }
  }
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
    : Math.sign(num) * Math.abs(num);
}
