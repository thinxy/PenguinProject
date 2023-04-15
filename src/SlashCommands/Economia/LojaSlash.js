import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class LojaSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "loja",
      description:
        "｢economia｣veja a loja e compre processador novo para conseguir minerar bitcoins mais rapido.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "buy",
          description:
            "｢economia｣compre processador novo para conseguir minerar bitcoins mais rapido.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "id",
              description: "coloque o id do produto que você deseja comprar.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "view",
          description:
            "｢economia｣veja a loja e compre processador novo para conseguir minerar bitcoins mais rapido.",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
      help: {
        usage: "/loja",
      },
    });
  }
  async run(interaction) {
    switch (interaction.options.getSubcommand()) {
      case "view": {
        const embed = new EmbedBuilder()
          .setTitle("🛒 **-** Lojinha de Processador")
          .setFields(
            {
              name: `Processador: \`Metalic ( ID: pr1 )\``,
              value: `**Preço:** \`35,000 Gelitos\`\n**Cooldown:** \`45 Minutos\`\n**Usos:** \`1.500\``,
            },
            {
              name: "Processador: `Iron ( ID: pr2 )`",
              value: `**Preço:** \`65,000 Gelitos\`\n**Cooldown:** \`30 Minutos\`\n**Usos:** \`3.500\``,
            },
            {
              name: "Processador: `Gold ( ID: pr3 )`",
              value: `**Preço:** \`95,000 Gelitos\`\n**Cooldown:** \`25 Minutos\`\n**Usos:** \`5.500\``,
            },
            {
              name: "Processador: `Diamond ( ID: pr4 )`",
              value: `**Preço:** \`150,000 Gelitos\`\n**Cooldown:** \`15 Minutos\`\n**Usos:** \`8.500\``,
            },
            {
              name: "Processador: `VIP ( ID: pr5 )` Dado ao comprar VIP",
              value: `**Preço:** \`VIP Mensal\`\n**Cooldown:** \`10 Minutos\`\n**Usos:** \`♾️\``,
            }
          )
          .setColor(this.client.config.color)
          .setTimestamp()
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `Comando utilizado por ${interaction.user.tag}`,
            iconURL: this.client.user.displayAvatarURL(),
          });

        interaction.editReply({
          content: `${interaction.user}`,
          embeds: [embed],
        });

        break;
      }
      case "buy": {
        const userdb = await this.client.db.users.findOne({
          where: { id: interaction.user.id }
        })
        let pro, preço, cd, usos;

        switch (interaction.options.getString("id")) {
          case "pr1":
            pro = "pr1";
            nome = "Metalic"
            preço = 35000;
            cd = 2700000;
            usos = 1500;
            break;
          case "pr2":
            pro = "pr2";
            nome = "Iron"
            preço = 65000;
            cd = 1800000;
            usos = 3500;
            break;
          case "pr3":
            pro = "pr3";
            nome = "Gold"
            preço = 95000;
            cd = 1500000;
            usos = 5500;
            break;
          case "pr4":
            pro = "pr4";
            nome = "Diamont"
            preço = 150000;
            cd = 900000;
            usos = 8500;
            break;
        }

        const data = cd

        if (userdb.dataValues.money < preço) {
          return interaction.editReply(`${this.client.emoji.error} **-** ${interaction.user}, você não tem o valor necessário para comprar o produto.`)
        }

        interaction.editReply(`${this.client.emoji.correct} **-** ${interaction.user}, você comprou com sucesso o produto com o ID \`${pro}\`, para ver as informações utilize \`/processador\`.`)

        await this.client.db.users.update({
          mines: SQL.literal(`mines + ${usos}`),
          timeTeste: parseInt(data),
          money: SQL.literal(`money - ${preço}`),
          proName: nome
        },
        {
          where: { id: interaction.user.id }
        })
      }
    }
  }
}
