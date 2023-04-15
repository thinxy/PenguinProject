import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";

export default class BitcoinsSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bitcoins",
      description: "nada",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "saldo",
          description:
            "｢Economia｣ veja o seu saldo de bitcoins ou de algum usuário.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description:
                "mencione o usuário que você deseja ver o saldo de bitcoins.",
              type: ApplicationCommandOptionType.User,
              required: false,
            },
          ],
        },
        {
          name: "status",
          description:
            "｢Economia｣ veja o status do bitcoin e veja o quanto que ele está valendo agora.",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
      help: {
        usage: "/bitcoins",
      },
    });
  }
  async run(interaction, prefix, args) {
    switch (interaction.options.getSubcommand()) {
      case "saldo": {
        const user = interaction.options.getUser("user") || interaction.user;

        if (user.id != interaction.user.id) {
          let userdb = await this.client.db.users.findOne({
            where: { id: user.id },
          });

          if (!userdb) {
            return interaction.editReply({
              content: `${this.client.emoji.error} **-** ${interaction.user}, o usuário mencionado não está registrado em minha database.`,
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

        if (user.id === interaction.user.id) {
          interaction.editReply(
            `${this.client.emoji.coin} **-** ${
              interaction.user
            }, você possui **${money.toLocaleString(
              "en-US"
            )} Bitcoins ( ${money.toLocaleString("pt-BR", {
              notation: "compact",
              maximumFractionDigits: 1,
            })} )** em sua carteira, você está em **#${position}** no top, para ver o top dos mais ricos utilize \`${prefix}rank\`.`
          );
        } else {
          interaction.editReply(
            `${this.client.emoji.coin} **-** ${interaction.user}, o usuário \`${
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
              value: "\`10%\`",
            },
            {
              name: "Valor atualiza em:",
              value: `<t:${data}:R>`,
            }
          );

        await interaction.editReply({
          content: `${interaction.user}`,
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
