import unabbreviate from "util-stunks/src/func/unabbreviate.js";
import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import SQL from "sequelize"

export default class RifaCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rifa",
      description: "「Economia」veja as informações da PanguinLand Rifa.",
      help: {
        usage: "{prefix}rifa",
      },
    });
  }
  async run(message, args, prefix) {
    let arg = args[0] || "view";
    switch (arg) {
      case "view": {
        const user = await this.client.db.ruffle.findOne({
          where: { id: this.client.user.id },
        });
        const userC = await this.client.db.users.findOne({
          where: { id: message.author.id },
        });

        const rifTime = user.dataValues.rifatime - Date.now();
        const rifaTime = `${ms(rifTime).hours} horas ${
          ms(rifTime).minutes
        } minutos ${ms(rifTime).seconds} segundos`;

        message.reply(
          `${
            message.author
          }\n🎫 **-** PenguinLand Rifa\n💵 **-** Premiação: \`${user.dataValues.rifavalue.toLocaleString()}\`\n🎟️ **-** Tickets Comprados: \`${
            user.dataValues.rifabilhete
          }\`\n👥 **-** Participantes: \`${
            user.dataValues.rifausers.length
          }\`\n💸 **-** Último Ganhador: \`${
            user.dataValues.rifaganhador
          }\`\n⏲️ **-** Resultado irá sair em \`${rifaTime}\`\n\n> ❓ **-** Quer participar também use o comando \`${prefix}rifa buy <quantidade>\`, cada bilhete custa **250 Gelitos**.`
        );
        break;
      }
      case "buy": {
        const user = await this.client.db.users.findOne({
          where: { id: message.author.id },
        });
        const userC = await this.client.db.ruffle.findOne({
          where: { id: this.client.user.id },
        });

        const total = unabbreviate(args[1]);
        const valor = total * 250;

        const rifTime = userC.dataValues.rifatime - Date.now();
        const rifaTime = `${ms(rifTime).hours} horas ${
          ms(rifTime).minutes
        } minutos ${ms(rifTime).seconds} segundos`;
        const data = ~~((Date.now() + rifTime) / 1000);

        if (Date.now() > user.dataValues.daily) {
          return message.reply({
            content: `${this.client.emoji.temp} **-** ${message.author}, você não resgatou o seu prêmio diário use \`${prefix}daily\` para poder usar meus comandos de economia.`,
            ephemeral: true,
          });
        }

        if (!total) {
          return message.reply(
            `${this.client.emoji.error} **-  ${message.author}**, você precisa colocar uma quantidade de tickets para poder comprar os bilhetes para a rifa.\n\n> ❓ **-** Para comprar tickets utilize \`${prefix}buy rifa <quantidade>\`.`
          );
        }

        if (total <= 0) {
          return message.reply(
            `${this.client.emoji.error} **- ${message.author}**, você precisa colocar uma quantia maior que **0**.`
          );
        }

        if (isNaN(total)) {
          return message.reply(
            `${this.client.emoji.error} **- ${message.author}**, você precisa colocar um valor númerico, pois minha database não lê letras como número.`
          );
        }

        if (user.dataValues.money < valor) {
          return message.reply(
            `${this.client.emoji.error} **- ${
              message.author
            }**, Você não possui o valor de **${valor.toLocaleString()} Gelitos** para comprar **${total} tickets**.`
          );
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL("https://penguinbot.online/suporte")
            .setLabel("Servidor de suporte")
            .setEmoji("<:kbe_ePartneredserver:975066666843127808>")
        );

        message.reply({
          content: `${this.client.emoji.correct} **- ${
            message.author
          }**, Você comprou **${total} ticket(s)** por **${valor.toLocaleString()} Gelitos**, com sucesso agora basta esperar <t:${data}:R> \`${rifaTime}\` para ver o ganhador, caso queira ver os vencedores das rifas á todo momento, entre no meu servidor de suporte.`,
          components: [row],
        });

        await this.client.db.users.update(
          { money: SQL.literal(`money - ${valor}`) },
          {
            where: { id: message.author.id },
          }
        );

        if (!userC.dataValues.rifausers.includes(message.author.id)) {
          let raffle_data = await this.client.db.ruffle.findByPk(
            this.client.user.id
          ); //puxa os dados da rifa
          let array_users = raffle_data.rifausers || [];
          array_users.push(message.author.id);

          this.client.db.ruffle.update(
            {
              rifausers: array_users,
            },
            {
              where: { id: this.client.user.id },
            }
          );

          await this.client.db.ruffle.update(
            {
              rifabilhete: SQL.literal(`rifabilhete + ${total}`),
            },
            {
              where: { id: this.client.user.id },
            }
          );

          await this.client.db.ruffle.update(
            {
              rifavalue: SQL.literal(`rifavalue + ${valor}`),
            },
            {
              where: { id: this.client.user.id },
            }
          );
        }
      }
    }
  }
}

function ms(ms) {
  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);
  const days = ~~(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}
