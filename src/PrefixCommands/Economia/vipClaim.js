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

export default class VipClaimCommand extends Command {
  constructor(client) {
    super(client, {
      name: "vip-claim",
      description: "「Economia」resgate seu prêmio vip de Gelitos.",
      aliases: ['vic'],
      help: {
        usage: "{prefix}vip-claim",
      },
    });
  }
  async run(message, args, prefix) {
    let userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (Date.now() < userdb.dataValues.vic) {
      const calc = userdb.dataValues.vic - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
        ephemeral: true,
      });
    }

    let vip = userdb.dataValues.vip - Date.now();

    if (Date.now() < userdb.dataValues.vip) {
      const data = ~~((Date.now() + 43200000) / 1000);

      const m = Math.floor(Math.random() * 10000 + 1500);

      const next = Date.now() + 43200000;

      let btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(false)
          .setCustomId(`lvic-${message.author.id}-${next}`)
          .setLabel("Ativar Lembrete")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Primary)
      );

      const eb = new EmbedBuilder()
        .setTitle("❄️ **-** Vip Prize")
        .setDescription(
          `**${
            message.author.tag
          } -** você acaba de resgatar seu prêmio vip, com isto você recebeu o valor de **${m.toLocaleString(
            "en-US"
          )} Gelitos**, você poderá retornar aqui em [<t:${data}>] (<t:${data}:R>), para resgatar seu prêmio Vip de Gelitos.`
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
        )} Gelitos** em seu prêmio vip.`
      );

      await this.client.db.users.update(
        {
          money: SQL.literal(`money + ${m}`),
          vic: parseInt(Date.now() + 43200000),
          tr: t,
          lembreteVic: false,
          channelVic: message.channel.id,
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
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você não é um usuário vip, caso queira comprar entre em minha loja <https://penguinbot.online/loja>`,
        ephemeral: true,
      });
    }
  }
}
