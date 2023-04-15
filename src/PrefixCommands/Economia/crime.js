import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import { random } from "undefined_package";
import ms from "ms";
import SQL from "sequelize";

export default class CrimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "crime",
      description: "「Economia」roube algum lugar e receba ou perca Gelitos.",
      aliases: ["c"],
      help: {
        usage: "{prefix}crime",
      },
    });
  }
  async run(message, args, prefix) {
    let userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (Date.now() > userdb.dataValues.daily) {
      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você não resgatou o seu prêmio diário use ${prefix}daily para poder usar meus comandos de economia.`,
        ephemeral: true,
      });
    }

    if (Date.now() < userdb.dataValues.crime) {
      const calc = userdb.dataValues.crime - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    const lugar = random([
      "Shopping",
      "Barco",
      "Banco",
      "Pessoa",
      "Casa",
      "Club",
      "Pizzaria",
    ]);

    const n = random(["1", "2"]);

    const data = ~~((Date.now() + ms("3h")) / 1000);

    const m = Math.floor(Math.random() * 10000);

    if (n <= 2) {
      const next = Date.now() + ms("3h");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`lcrime-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("🔫 **-** Crime `(Success)`")
        .setDescription(
          `**${
            message.author.tag
          } -** você acaba de assaltar um\`(a)\` ${lugar}, com isso você conseguiu levar **${m.toLocaleString(
            "en-US"
          )} Gelitos**, você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para assaltar um lugar e receber Gelitos.`
        )
        .setColor(`Green`)
        .setFooter({
          text: `Comando usado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      let t = userdb.dataValues.tr;
      if (!t) t = [];

      t.unshift(
        `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
          message.createdAt / 1000
        )}:t>] 📥 **|** Recebeu **${m.toLocaleString(
          "en-US"
        )} Gelitos** roubando um\`(a)\` ${lugar}.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          crime: parseInt(Date.now() + 10800000),
          tr: t,
          lembreteCrime: false,
          channelCrime: message.channel.id,
        },
        {
          where: { id: message.author.id },
        }
      );

      const msg = await message.reply({
        content: `${message.author}`,
        embeds: [eb],
        components: [btn],
        fetchReply: true,
      });
    } else {
      const next = Date.now() + ms("3h");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`lcrime-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("🔫 **-** Crime `(Lost)`")
        .setDescription(
          `**${
            message.author.tag
          } -** você acaba de assaltar um\`(a)\` ${lugar}, com isso você **não conseguiu** levar **${m.toLocaleString(
            "en-US"
          )} Gelitos**, você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para assaltar um lugar e receber Gelitos.`
        )
        .setColor(`Red`)
        .setFooter({
          text: `Comando usado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      let t = userdb.dataValues.tr;
      if (!t) t = [];

      t.unshift(
        `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
          message.createdAt / 1000
        )}:t>] 📤 **|** Enviou **${m.toLocaleString(
          "en-US"
        )} Gelitos** roubando um\`(a)\` ${lugar}.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          crime: parseInt(Date.now() + 10800000),
          tr: t,
          lembreteCrime: false,
          channelCrime: message.channel.id,
        },
        {
          where: { id: message.author.id },
        }
      );

      const msg = await message.reply({
        content: `${message.author}`,
        embeds: [eb],
        components: [btn],
        fetchReply: true,
      });
    }
  }
}
