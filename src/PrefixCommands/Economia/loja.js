import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import Command from "../../Structures/base/Command.js";
import SQL from "sequelize";

export default class LojaCommand extends Command {
  constructor(client) {
    super(client, {
      name: "loja",
      description:
        "｢economia｣veja a loja e compre processador novo para conseguir minerar bitcoins mais rapido.",
      help: {
        usage: "{prefix}loja",
      },
    });
  }
  async run(message, args, prefix) {
    let arg = args[0];

    if (!arg)
      return message.reply(
        `${this.client.emoji.error} **-** ${message.author}, você não específicou oque deseja ver, caso queira comprar use \`${prefix}loja buy <id>\` ou \`${prefix}loja view\`.`
      );
    switch (arg) {
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
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `Comando utilizado por ${message.author.tag}`,
            iconURL: this.client.user.displayAvatarURL(),
          });

        message.reply({
          content: `${message.author}`,
          embeds: [embed],
        });

        break;
      }
      case "buy": {
        const userdb = await this.client.db.users.findOne({
          where: { id: message.author.id },
        });

        let id = args[1];

        if (!id)
          return message.reply(
            `${this.client.emoji.error} **-** ${message.author}, você não colou um id válido de um produto.`
          );

        let pro, preço, cd, usos, n;

        switch (id) {
          case "pr1":
            pro = "pr1";
            n = "Metalic";
            preço = 35000;
            cd = 2700000;
            usos = 1500;
            break;
          case "pr2":
            pro = "pr2";
            n = "Iron";
            preço = 65000;
            cd = 1800000;
            usos = 3500;
            break;
          case "pr3":
            pro = "pr3";
            n = "Gold";
            preço = 95000;
            cd = 1500000;
            usos = 5500;
            break;
          case "pr4":
            pro = "pr4";
            n = "Diamont";
            preço = 150000;
            cd = 900000;
            usos = 8500;
            break;
        }

        const data = cd;
        let name = n

        if (userdb.dataValues.money < preço) {
          return message.reply(
            `${this.client.emoji.error} **-** ${message.author}, você não tem o valor necessário para comprar o produto.`
          );
        }

        message.reply(
          `${this.client.emoji.correct} **-** ${message.author}, você comprou com sucesso o produto com o ID \`${pro}\`, para ver as informações utilize \`/processador\`.`
        );

        await this.client.db.users.update(
          {
            mines: SQL.literal(`mines + ${usos}`),
            timeTeste: parseInt(data),
            money: SQL.literal(`money - ${preço}`),
            proName: name,
          },
          {
            where: { id: message.author.id },
          }
        );
      }
    }
  }
}
