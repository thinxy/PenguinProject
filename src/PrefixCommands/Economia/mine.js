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
import Command from "../../Structures/base/Command.js";
import SQL from "sequelize";

export default class MineCommand extends Command {
  constructor(client) {
    super(client, {
      name: "minerar",
      description: "｢economia｣minere bitcoins com seu computador.",
      help: {
        usage: "{prefix}minerar <quantia>",
      },
    });
  }
  async run(message, args, prefix) {
    const quantidade = Math.floor(Math.random() * 10000 + 1500);
    const userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    const cd = parseInt(userdb.dataValues.timeTeste);
    const data = Date.now() + cd;

    if (Date.now() > userdb.dataValues.daily) {
      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você não resgatou o seu prêmio diário use \`${prefix}daily\` para poder usar meus comandos de economia.`,
        ephemeral: true,
      });
    }

    if (Date.now() < userdb.dataValues.processador) {
      const calc = userdb.dataValues.processador - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    if (userdb.dataValues.mines <= 10) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, seu processador infelizmente quebrou, caso queira comprar um novo e mais potente utilize, \`/loja view\`.`,
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
            message.author
          }, Foram realizadas \`${tentativas.toLocaleString()}\` tentativas até encontrar o código \`${codigo}\` que concede \`${bitcoin.toFixed(
            2
          )} Gelicoins\`, para resgatar utilize \`/resgatar\` para você não perde-lo.`
        )
        .setFooter({
          text: "©️ Desenvolvido por Purplerain#0132 - 2023",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });
      await message.reply({
        content: `${message.author}`,
        embeds: [embed],
      });

      await this.client.db.users.update(
        {
          mines: SQL.literal(`mines - 25`),
          CodeUser: codigo,
          processador: parseInt(data),
        },
        {
          where: { id: message.author.id },
        }
      );
    } else {
      await message.reply(
        `${this.client.emoji.error} **-** ${message.author}, Infelizmente, não foi possível encontrar algum código válido após \`${quantidade}\` tentativas.`
      );

      await this.client.db.users.update(
        {
          mines: SQL.literal(`mines - 15`),
          processador: parseInt(data),
        },
        {
          where: { id: message.author.id },
        }
      );
    }
  }
}
