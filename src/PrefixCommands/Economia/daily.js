import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import ms from "ms";
import SQL from "sequelize";

export default class DailyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "「Economia」resgate seu prêmio diário de Gelitos.",
      aliases: ['d','diario','diário'],
      help: {
        usage: "{prefix}daily",
      },
    });
  }
  async run(message, args, prefix) {
    let userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (Date.now() < userdb.dataValues.daily) {
      const calc = userdb.dataValues.daily - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    let vip = userdb.dataValues.vip - Date.now();

    if (Date.now() < userdb.dataValues.vip) {
      const data = ~~((Date.now() + 86400000) / 1000);

      const m = Math.floor(Math.random() * 10000 + 1500);

      const next = Date.now() + ms("24h");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`ldaily-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("❄️ **-** Daily Prize")
        .setDescription(
          `**${
            message.author.tag
          } -** você acaba de resgatar seu prêmio diário, com isto você recebeu o valor de **${m.toLocaleString(
            "en-US"
          )} Gelitos**, mais como você é um usuário premium você recebeu um valor de \`1.500 Gelitos\` de bônus! você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para resgatar seu prêmio Diário de Gelitos.`
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
        )} Gelitos** em seu prêmio diário.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          daily: parseInt(Date.now() + 86400000),
          tr: t,
          lembreteDaily: false,
          channelDaily: message.channel.id,
        },
        {
          where: { id: message.author.id },
        }
      );

      message.reply({
        content: `${message.author}`,
        embeds: [eb],
        components: [btn],
        fetchReply: true,
      });
    } else {
      const data = ~~((Date.now() + 86400000) / 1000);

      const m = Math.floor(Math.random() * 10000);
      const next = Date.now() + ms("24h");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`ldaily-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("❄️ **-** Daily Prize")
        .setDescription(
          `**${
            message.author.tag
          } -** você acaba de resgatar seu prêmio diário, com isto você recebeu o valor de **${m.toLocaleString(
            "en-US"
          )} Gelitos**, você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para resgatar seu prêmio Diário de Gelitos.`
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
        )} Gelitos** em seu prêmio diário.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          daily: parseInt(Date.now() + 86400000),
          tr: t,
          lembreteDaily: false,
          channelDaily: message.channel.id,
        },
        {
          where: { id: message.author.id },
        }
      );

      message.reply({
        content: `${message.author}`,
        embeds: [eb],
        components: [btn],
        fetchReply: true,
      });
    }
  }
}
