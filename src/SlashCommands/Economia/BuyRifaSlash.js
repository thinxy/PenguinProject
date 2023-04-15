import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import SQL from "sequelize";

export default class BuyRifaSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "buy",
      description: "「Economia」compre tickets para participar da rifa.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "rifa",
          description: "「Economia」compre tickets para participar da rifa.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "value",
              description:
                "Coloque a quantidade de bilhetes que deseja comprar. Obs: cada ticket custa 250 Gelitos.",
              type: ApplicationCommandOptionType.Number,
              required: true,
            },
          ],
        },
      ],
      help: {
        usage: "/buy rifa <quantidade>",
      },
    });
  }
  async run(interaction, prefix) {
    const user = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });
    const userC = await this.client.db.ruffle.findOne({
      where: { id: this.client.user.id },
    });

    const total = interaction.options.getNumber("value");
    const valor = total * 250;

    const rifTime = userC.dataValues.rifatime - Date.now();
    const rifaTime = `${ms(rifTime).hours} horas ${
      ms(rifTime).minutes
    } minutos ${ms(rifTime).seconds} segundos`;
    const data = ~~((Date.now() + rifTime) / 1000);

    if (!total) {
      return interaction.editReply(
        `${this.client.emoji.error} **-  ${interaction.user}**, você precisa colocar uma quantidade de tickets para poder comprar os bilhetes para a rifa.\n\n> ❓ **-** Para comprar tickets utilize \`${prefix}buy rifa <quantidade>\`.`
      );
    }

    if (total <= 0) {
      return interaction.editReply(
        `${this.client.emoji.error} **- ${interaction.user}**, você precisa colocar uma quantia maior que **0**.`
      );
    }

    if (isNaN(total)) {
      return interaction.editReply(
        `${this.client.emoji.error} **- ${interaction.user}**, você precisa colocar um valor númerico, pois minha database não lê letras como número.`
      );
    }

    if (user.dataValues.money < valor) {
      return interaction.editReply(
        `${this.client.emoji.error} **- ${
          interaction.user
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

    interaction.editReply({
      content: `${this.client.emoji.correct} **- ${
        interaction.user
      }**, Você comprou **${total} ticket(s)** por **${valor.toLocaleString()} Gelitos**, com sucesso agora basta esperar <t:${data}:R> \`${rifaTime}\` para ver o ganhador, caso queira ver os vencedores das rifas á todo momento, entre no meu servidor de suporte.`,
      components: [row],
    });

    await this.client.db.users.update(
      { money: SQL.literal(`money - ${valor}`) },
      {
        where: { id: interaction.user.id },
      }
    );

    if (!userC.dataValues.rifausers.includes(interaction.user.id)) {

      let raffle_data = await this.client.db.ruffle.findByPk(this.client.user.id); //puxa os dados da rifa
      let array_users = raffle_data.rifausers || [];
      array_users.push(interaction.user.id);

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
          rifabilhete: SQL.literal(`rifabilhete + ${total}`)
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

function formatTime(ms) {
  let seconds = ms / 1000;
  const minutes = parseInt(seconds / 60);
  seconds = parseInt(seconds % 60);
  const hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;

  if (hours) {
    return `${hours} horas, ${minutes} minutos e ${seconds} segundos`;
  } else if (minutes) {
    return `${minutes} minutos e ${seconds} segundos`;
  }
  return `${seconds} segundos`;
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
