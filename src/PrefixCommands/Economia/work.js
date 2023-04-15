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
      name: "work",
      description:
        "「Economia」trabalhe e consiga prêmios, suba de nível para receber mais Gelitos.",
      aliases: ['w','trabalhar'],
      help: {
        usage: "{prefix}work",
      },
    });
  }
  async run(message, args, prefix) {
    let userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (Date.now() < userdb.dataValues.work) {
      const calc = userdb.dataValues.work - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    let vip = userdb.dataValues.vip - Date.now();

    if (Date.now() < userdb.dataValues.vip) {
      let xpp = parseInt(userdb.dataValues.xp);
      let lv = parseInt(userdb.dataValues.level);
      const xp = Math.floor(Math.random() * 10 + 2);

      if (xpp > 500) {
        await this.client.db.users.update(
          {
            level: SQL.literal(`level + 1`),

            xp: 0,
          },
          {
            where: { id: message.author.id },
          }
        );

        xpp = xp;
        lv = lv + 1;

        message.channel.send(
          `🎉 **-** ${message.author} você atingiu as experiências necessárias para subir de level em seu trabalho! Você passou para o level **${lv}**.`
        );
      }

      let res = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 500) res = "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩";
      if (xpp < 450) res = "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜";
      if (xpp < 400) res = "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜";
      if (xpp < 350) res = "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
      if (xpp < 300) res = "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜";
      if (xpp < 250) res = "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜";
      if (xpp < 200) res = "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜";
      if (xpp < 150) res = "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 100) res = "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 50) res = "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 25) res = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";

      const data = ~~((Date.now() + ms("30m")) / 1000);

      const m = Math.floor(Math.random() * 10000 + 1500);

      const next = Date.now() + ms("30m");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`lwork-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("❄️ **-** Work")
        .setDescription(
          `**${
            message.author.tag
          } -** parabéns você concluiu seu trabalho, com isto você recebeu o valor de **${m.toLocaleString(
            "en-US"
          )} Gelitos**, mais como você é um usuário premium você recebeu um valor de \`1.500 Gelitos\` de bônus! você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para trabalhar novamente e receber Gelitos.`
        )
        .setColor(`Green`)
        .setFooter({
          text: `Comando usado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp()
        .addFields({
          name: `Progresso - \`[${xpp + xp}/500]\``,
          value: `${res}`,
        });

      let t = userdb.dataValues.tr;
      if (!t) t = [];

      t.unshift(
        `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
          message.createdAt / 1000
        )}:t>] 📥 **|** Recebeu **${m.toLocaleString(
          "en-US"
        )} Gelitos** em seu trabalho.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          work: parseInt(Date.now() + ms("30m")),
          tr: t,
          lembreteWork: false,
          channelWork: message.channel.id,
          xp: SQL.literal(`xp + ${xp}`),
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
      let xpp = parseInt(userdb.dataValues.xp);
      let lv = parseInt(userdb.dataValues.level);
      let xp = Math.floor(Math.random() * 10 + 2);

      if (xpp > 500) {
        await this.client.db.users.update(
          {
            level: SQL.literal(`level + 1`),

            xp: SQL.literal(`xp + ${xp}`),
          },
          {
            where: { id: message.author.id },
          }
        );

        xpp = xp;
        lv = lv + 1;

        message.channel.send(
          `🎉 **-** ${message.author} você atingiu as experiências necessárias para subir de level em seu trabalho! Você passou para o level **${lv}**.`
        );
      }

      let res = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";

      if (xpp < 500) res = "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩";

      if (xpp < 450) res = "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜";
      if (xpp < 400) res = "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜";
      if (xpp < 350) res = "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜";
      if (xpp < 300) res = "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜";
      if (xpp < 250) res = "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜";
      if (xpp < 200) res = "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜";
      if (xpp < 150) res = "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 100) res = "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 50) res = "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜";
      if (xpp < 25) res = "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜";

      const data = ~~((Date.now() + ms("30m")) / 1000);

      const m = Math.floor(Math.random() * 10000);
      const next = Date.now() + ms("30m");

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`lwork-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("❄️ **-** Work")
        .setDescription(
          `**${
            message.author.tag
          } -** parabéns você concluiu seu trabalho, com isto você recebeu o valor de **${m.toLocaleString(
            "en-US"
          )} Gelitos**, você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para trabalhar novamente e receber Gelitos.`
        )
        .addFields({
          name: `Progresso - \`[${xpp + xp}/500]\``,
          value: `${res}`,
        })
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
        )} Gelitos** em seu trabalho.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          work: parseInt(Date.now() + ms("30m")),
          tr: t,
          lembreteWork: false,
          channelWork: message.channel.id,
          xp: SQL.literal(`xp + ${xp}`),
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
