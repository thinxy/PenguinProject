const codigos = {
  ABCD: 0.1,
  EFGH: 0.2,
  IJKL: 0.3,
  MNOP: 0.4,
  QRST: 0.5,
};

function gerarCodigoAleatorio() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const codigo = [];
  for (let i = 0; i < 4; i++) {
    codigo.push(letras[Math.floor(Math.random() * letras.length)]);
  }
  return codigo.join("");
}

import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class MineSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "minerar",
      description: "｢economia｣minere bitcoins com seu computador.",
      type: ApplicationCommandType.ChatInput,

      /*
      options: [
        {
          name: "quantidade",
          description:
            "coloque o valor do tanto de vezes você deseja minerar. OBS: minimo: 10",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      */

      help: {
        usage: "/minerar <quantia>",
      },
    });
  }
  async run(interaction) {
    const quantidade = Math.floor(Math.random() * 10000 + 1500);
    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    const cd = parseInt(userdb.dataValues.timeTeste);
    const data = Date.now() + cd

    if (Date.now() < userdb.dataValues.processador) {
      const calc = userdb.dataValues.processador - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return interaction.editReply({
        content: `${this.client.emoji.temp} **-** ${interaction.user}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    if (quantidade >= userdb.dataValues.mines) {
      return interaction.followUp({
        content: `${this.client.emoji.error} **-** ${interaction.user}, seu processador não aguenta gerar o tanto de códigos que você colocou, para ver informações sobre seu processador utilize \`/processador\`.`,
        ephemeral: true,
      });
    }

    /*
    if (quantidade < 10) {
      return interaction.followUp({
        content: `${this.client.emoji.error} **-** ${interaction.user}, você não pode minerar menos que \`10 códigos\`, tente novamente!`,
        ephemeral: true,
      });
    }
    */

    if (userdb.dataValues.mines <= 10) {
      return interaction.followUp({
        content: `${this.client.emoji.error} **-** ${interaction.user}, seu processador infelizmente quebrou, caso queira comprar um novo e mais potente utilize, \`/loja view\`.`,
        ephemeral: true,
      });
    }

    let codigo;
    let encontrado = false;
    let tentativas = 0;

    while (!encontrado && tentativas < quantidade) {
      codigo = gerarCodigoAleatorio();
      if (codigo in codigos) {
        encontrado = true;
      } else {
        tentativas++;
      }
    }

    if (encontrado) {
      const bitcoin = codigos[codigo];
      const embed = new EmbedBuilder()
        .setColor(this.client.config.color)
        .setTitle("⛏️ **-** Mineração de código")
        .setDescription(
          `${this.client.emoji.correct} **-** ${
            interaction.user
          }, Foram realizadas \`${tentativas.toLocaleString()}\` tentativas até encontrar o código \`${codigo}\` que concede \`${bitcoin.toFixed(
            2
          )} Gelicoins\`, para resgatar utilize \`/resgatar\` para você não perde-lo.`
        )
        .setFooter({
          text: "©️ Desenvolvido por Purplerain#0132 - 2023",
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });
      await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
      });

      await this.client.db.users.update(
        {
          mines: SQL.literal(`mines - 25`),
          CodeUser: codigo,
          processador: parseInt(data),
        },
        {
          where: { id: interaction.user.id },
        }
      );
    } else {
      await interaction.editReply(
        `${this.client.emoji.error} **-** ${interaction.user}, Infelizmente, não foi possível encontrar algum código válido após \`${quantidade}\` tentativas.`
      );

      await this.client.db.users.update(
        {
          mines: SQL.literal(`mines - 15`),
          processador: parseInt(data),
        },
        {
          where: { id: interaction.user.id },
        }
      );
    }
  }
}
