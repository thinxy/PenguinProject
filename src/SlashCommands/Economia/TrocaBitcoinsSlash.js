import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class TrocaBitcoinSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "trocar",
      description: "｢economia｣troque seus bitcoins por Gelitos.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "bitcoins",
          description: "coloque a quantidade de bitcoins que deseja trocar.",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      help: {
        usage: "/trocar <quantidade>",
      },
    });
  }
  async run(interaction) {
    const minerios = interaction.options.getNumber("bitcoins");
    const cotacao = 100;
    const gelitos = Math.floor((minerios / cotacao) * 0.9);
    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    const clientdb = await this.client.db.users.findOne({
      where: { id: this.client.user.id }
    })
    const bitcoin = clientdb.dataValues.bitcoinValue

    if (userdb.dataValues.bitcoins < minerios) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, você não tem o valor de \`${minerios} Bitcoins\` que me informou, para ver seus Bitcoins utilize \`/bitcoins\`.`,
      });
    }

    if (userdb.dataValues.bitcoin < 5) {
      return interaction.editReply(``)
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setTitle("Troca de Bitcoins por Gelitos")
      .setDescription(
        `${this.client.emoji.correct} **-** ${interaction.user}, Você trocou ${minerios} Bitcoins por ${bitcoin.toLocaleString()} Gelitos.`
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

    await interaction.editReply({
      content: `${interaction.user}`,
      embeds: [embed],
    });

    await this.client.db.users.update(
      {
        money: SQL.literal(`money + ${bitcoin}`),
        bitcoins: SQL.literal(`bitcoins - ${minerios}`),
      },
      {
        where: { id: interaction.user.id },
      }
    );
  }
}
