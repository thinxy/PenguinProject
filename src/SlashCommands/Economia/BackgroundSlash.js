import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ApplicationCommandType,
} from "discord.js";
import p from "../../Utils/shop.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize"

export default class BackgroundSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "background",
      description:
        "「Economia」edite seu background ou compre um novo para seu perfil!",
      type: ApplicationCommandType.ChatInput,
      help: {
        usage: "/background",
      },
    });
  }
  async run(interaction) {
    const user = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });
    let page = 0;

    let embeds = await p.pages();

    const ButtonBuy = new ButtonBuilder()
      .setLabel(`Comprar`)
      .setCustomId("buy")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🛒");

    const ButtonEquip = new ButtonBuilder()
      .setCustomId("equip")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("📥")
      .setLabel(`Equipar`);

    const ButtonVoltar = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji("⬅️")
      .setStyle(1)
      .setDisabled(true);

    const ButtonProximo = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("➡️")
      .setStyle(1);

    if (!embeds[1]) ButtonProximo.setDisabled(true);

    if (
      user.dataValues.money < embeds[page].value &&
      !user.dataValues.background.includes(embeds[page].image)
    ) {
      ButtonBuy.setDisabled(true);
      ButtonEquip.setDisabled(true);
      ButtonBuy.setLabel(`Gelitos insuficientes`);
      ButtonBuy.setStyle(4);
      ButtonEquip.setLabel(`Não possui`);
      ButtonEquip.setStyle(4);
    } else if (
      user.dataValues.money >= embeds[page].value &&
      !user.dataValues.background.includes(embeds[page].image)
    ) {
      ButtonBuy.setDisabled(false);
      ButtonBuy.setLabel(`Comprar`);
      ButtonBuy.setStyle(ButtonStyle.Success);
      ButtonEquip.setDisabled(true);
      ButtonEquip.setLabel(`Não possui`);
      ButtonEquip.setStyle(4);
    } else if (
      user.dataValues.background.includes(embeds[page].image) &&
      user.dataValues.bgatual !== embeds[page].image
    ) {
      ButtonBuy.setDisabled(true);
      ButtonBuy.setLabel(`Já possui`);
      ButtonBuy.setStyle(ButtonStyle.Success);
      ButtonEquip.setDisabled(false);
      ButtonEquip.setLabel(`Equipar`);
      ButtonEquip.setStyle(ButtonStyle.Secondary);
    } else if (
      user.dataValues.background.includes(embeds[page].image) &&
      user.dataValues.bgatual === embeds[page].image
    ) {
      ButtonBuy.setDisabled(true);
      ButtonBuy.setLabel(`Já possui`);
      ButtonBuy.setStyle(ButtonStyle.Success);
      ButtonEquip.setDisabled(true);
      ButtonEquip.setLabel(`Já equipado`);
      ButtonEquip.setStyle(1);
    }

    const row = new ActionRowBuilder().addComponents(
      ButtonVoltar,
      ButtonBuy,
      ButtonEquip,
      ButtonProximo
    );

    let msg = await interaction.editReply({
      embeds: [embeds[0].embed],
      components: [row],
      fetchReply: true,
    });

    const filter = (user) => user;

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.user !== interaction.user) return;

      collector.resetTimer();

      if (i.customId === "next") {
        page = page + 1;

        if (
          user.dataValues.money < embeds[page].value &&
          !user.dataValues.background.includes(embeds[page].image)
        ) {
          ButtonBuy.setDisabled(true);
          ButtonEquip.setDisabled(true);
          ButtonBuy.setLabel(`Gelitos insuficiente`);
          ButtonBuy.setStyle(4);
          ButtonEquip.setLabel(`Não possui`);
          ButtonEquip.setStyle(4);
        } else if (
          user.dataValues.money >= embeds[page].value &&
          !user.dataValues.background.includes(embeds[page].image)
        ) {
          ButtonBuy.setDisabled(false);
          ButtonBuy.setLabel(`Comprar`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(true);
          ButtonEquip.setLabel(`Não possui`);
          ButtonEquip.setStyle(4);
        } else if (
          user.dataValues.background.includes(embeds[page].image) &&
          user.dataValues.bgatual !== embeds[page].image
        ) {
          ButtonBuy.setDisabled(true);
          ButtonBuy.setLabel(`Já possui`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(false);
          ButtonEquip.setLabel(`Equipar`);
          ButtonEquip.setStyle(ButtonStyle.Secondary);
        } else if (
          user.dataValues.background.includes(embeds[page].image) &&
          user.dataValues.bgatual === embeds[page].image
        ) {
          ButtonBuy.setDisabled(true);
          ButtonBuy.setLabel(`Já possui`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(true);
          ButtonEquip.setLabel(`Já equipado`);
          ButtonEquip.setStyle(ButtonStyle.Primary);
        }

        if (!embeds[page + 1]) {
          ButtonProximo.setDisabled(true);
        } else {
          ButtonProximo.setDisabled(false);
        }

        if (!embeds[page - 1]) {
          ButtonVoltar.setDisabled(true);
        } else {
          ButtonVoltar.setDisabled(false);
        }

        i.update({
          embeds: [embeds[page].embed],
          components: [row],
          fetchReply: true,
        });
      } else if (i.customId === "back") {
        page = page - 1;

        if (!embeds[page - 1]) {
          ButtonVoltar.setDisabled(true);
        } else {
          ButtonVoltar.setDisabled(false);
        }

        if (!embeds[page + 1]) {
          ButtonProximo.setDisabled(true);
        } else {
          ButtonProximo.setDisabled(false);
        }

        if (
          user.dataValues.money < embeds[page].value &&
          !user.dataValues.background.includes(embeds[page].image)
        ) {
          ButtonBuy.setDisabled(true);
          ButtonEquip.setDisabled(true);
          ButtonBuy.setLabel(`Gelitos insuficiente`);
          ButtonBuy.setStyle(4);
          ButtonEquip.setLabel(`Não possui`);
          ButtonEquip.setStyle(4);
        } else if (
          user.dataValues.money >= embeds[page].value &&
          !user.dataValues.background.includes(embeds[page].image)
        ) {
          ButtonBuy.setDisabled(false);
          ButtonBuy.setLabel(`Comprar`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(true);
          ButtonEquip.setLabel(`Não equipado`);
          ButtonEquip.setStyle(4);
        } else if (
          user.dataValues.background.includes(embeds[page].image) &&
          user.dataValues.bgatual !== embeds[page].image
        ) {
          ButtonBuy.setDisabled(true);
          ButtonBuy.setLabel(`Já possui`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(false);
          ButtonEquip.setLabel(`Equipar`);
          ButtonEquip.setStyle(ButtonStyle.Secondary);
        } else if (
          user.dataValues.background.includes(embeds[page].image) &&
          user.dataValues.bgatual === embeds[page].image
        ) {
          ButtonBuy.setDisabled(true);
          ButtonBuy.setLabel(`Já possui`);
          ButtonBuy.setStyle(ButtonStyle.Success);
          ButtonEquip.setDisabled(true);
          ButtonEquip.setLabel(`Já equipado`);
          ButtonEquip.setStyle(ButtonStyle.Primary);
        }

        i.update({
          embeds: [embeds[page].embed],
          components: [row],
          fetchReply: true,
        });
      } else if (i.customId === "buy") {
        if (user.dataValues.money < embeds[page].value)
          return i.followUp({
            content: `${this.client.emoji.error} **-** ${interaction.user}, você não possui dinheiro suficiente para comprar esse background.`,
            ephemeral: true,
          });

        let backgrounds_data = await this.client.db.users.findByPk(
          interaction.user.id
        ); //puxa os dados da rifa
        let array_users = backgrounds_data.background || [];
        array_users.push(interaction.user.id);

        await this.client.db.users.update(
          {
            background: array_users,
          },
          {
            where: { id: interaction.user.id },
          }
        );

        await this.client.db.users.update(
          {
            money: SQL.literal(money - embeds[page].value),
          },
          {
            where: { id: interaction.user.id },
          }
        );

        interaction.followUp({
          content: `🛒 | ${interaction.user}, background **${embeds[page].name}** comprado com sucesso!`,
        });
      } else if (i.customId === "equip") {
        if (!user.dataValues.background.includes(embeds[page].image))
          return i.followUp({
            content: `${this.client.emoji.error} **-** ${interaction.user} você não tem esse background.`,
            ephemeral: true,
          });

        await this.client.db.users.update(
          {
            bgatual: embeds[page].image,
          },
          {
            where: { id: interaction.user.id },
          }
        );

        interaction.followUp({
          content: `📥 | ${interaction.user}, background **${embeds[page].name}** equipado com sucesso!`,
        });
      }
    });
  }
}
