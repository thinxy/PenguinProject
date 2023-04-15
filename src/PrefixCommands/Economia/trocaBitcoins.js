import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import Command from "../../Structures/base/Command.js";
import SQL from "sequelize";

export default class TrocaBitcoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "trocar",
      description: "｢economia｣troque seus bitcoins por Gelitos.",
      help: {
        usage: "{prefix}trocar <quantidade>",
      },
    });
  }
  async run(message, args) {
    const minerios = parseInt(args[0]);
    const cotacao = 100;
    const gelitos = Math.floor((minerios / cotacao) * 0.9);
    const userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    const clientdb = await this.client.db.users.findOne({
      where: { id: this.client.user.id },
    });
    const bitcoin = clientdb.dataValues.bitcoinValue;

    if (!minerios) return message.reply(`${this.client.emoji.error} **-** ${message.author}, você não colocou nenhuma quantidade para trocar.`)

    if (userdb.dataValues.bitcoins < minerios) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você não tem o valor de \`${minerios} Bitcoins\` que me informou, para ver seus Bitcoins utilize \`/bitcoins\`.`,
      });
    }

    if (userdb.dataValues.bitcoin < 5) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setTitle("Troca de Bitcoins por Gelitos")
      .setDescription(
        `${this.client.emoji.correct} **-** ${
          message.author
        }, Você trocou ${minerios} Bitcoins por ${bitcoin.toLocaleString()} Gelitos.`
      )
      .addFields(
        {
          name: "Cotação de Gelitos",
          value: `**5 Bitcoins** => \`${bitcoin} Gelito\``,
        },
        {
          name: "Taxa da mineradora:",
          value: "10%",
        }
      );

    await message.reply({
      content: `${message.author}`,
      embeds: [embed],
    });

    await this.client.db.users.update(
      {
        money: SQL.literal(`money + ${bitcoin}`),
        bitcoins: SQL.literal(`bitcoins - ${minerios}`),
      },
      {
        where: { id: message.author.id },
      }
    );
  }
}
