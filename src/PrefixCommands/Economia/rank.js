import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} from "discord.js";
import { createCanvas, loadImage, registerFont } from "canvas";
import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";
import ms from "ms";
import SQL from "sequelize";
import { format } from "util";

export default class RankCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "「Economia」veja o top de usuários mais ricos do Penguin.",
      aliases: ['leaderboard','top'],
      help: {
        usage: "{prefix}rank <Gelitos || Curtidas> [page]",
      },
    });
  }
  async run(message, args, prefix) {
    let m = args[0] || "gelitos";

    if (m == "Gelitos" || m == "gelitos" || m == "money") {
      let userdb = await this.client.db.users.findAll({
        order: [["money", "DESC"]],
      });
      let usersDB = userdb
        .sort((a, b) => b.dataValues.money - a.dataValues.money)
        .slice(0, 5);

      registerFont("./src/Fonts/coolvetica.ttf", { family: "cool" });

      let page = parseInt(args[1]);

      if (page) {
        if (page > 5) page = 0;
        else if (page < 1) page = 0;
        else page = parseInt((page - 1) * 5);
      } else page = 0;
      if (isNaN(page)) page = 0;

      let users = await this.client.db.users
        .findAll({
          order: [["money", "DESC"]],
        })
        .then((x) => x.slice(page, page + 5));
      let image = createCanvas(480, 560),
        ctx = image.getContext("2d"); //diminui essa resolução

      for (let i = 0; i < users.length; i++) {
        let y = 93 * i,
          x = 155;
        let user = await this.client.users.fetch(users[i].id);

        ctx.save();
        let avatar = await loadImage(
          user.displayAvatarURL({ size: 2048, extension: "png" })
        );
        ctx.drawImage(avatar, x - 100, y + 90, 86, 86);
        ctx.restore();
      }

      let layout = await loadImage(
        "https://media.discordapp.net/attachments/1091937395231957214/1095400954200858624/1681176494036.png?width=512&height=597"
      );
      ctx.drawImage(layout, 0, 0, image.width, image.height);
      let j = 0;

      for (let i = 0; i < users.length; i++) {
        let y = 93 * i,
          x = 155,
          position = j++ * 90;

        let user = await this.client.users.fetch(users[i].id);

        ctx.save();
        ctx.font = user.tag.length >= 15 ? "13px cool" : "22px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(ctx, user.tag, x, y + 120);

        ctx.font = "21px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(
          ctx,
          `#${String(i + (page + 1))}`,
          x + 254,
          y + 106
        );

        ctx.font = "10px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(ctx, "ID: " + user.id, x, y + 134);

        ctx.font = "25px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(
          ctx,
          users[i].dataValues.money.toLocaleString("de-DE") + " Gelitos",
          x,
          y + 160
        );
        ctx.restore();
      }

      let attachment = new AttachmentBuilder(
        image.toBuffer(),
        "leaderboard.png"
      );

      await message.reply({
        content: message.author.toString(),
        files: [attachment],
      });
    }
    if (m == "Curtidas" || m == "curtidas" || m == "reps" || m == "Reputações" || m == "reputações") {
      registerFont("./src/Fonts/coolvetica.ttf", { family: "cool" });

      let page = parseInt(args[1]);

      if (page) {
        if (page > 5) page = 0;
        else if (page < 1) page = 0;
        else page = parseInt((page - 1) * 5);
      } else page = 0;
      if (isNaN(page)) page = 0;

      let users = await this.client.db.users
        .findAll({
          order: [["money", "DESC"]],
        })
        .then((x) => x.slice(page, page + 5));
      let image = createCanvas(480, 560),
        ctx = image.getContext("2d"); //diminui essa resolução

      for (let i = 0; i < users.length; i++) {
        let y = 93 * i,
          x = 155;
        let user = await this.client.users.fetch(users[i].id);

        ctx.save();
        let avatar = await loadImage(
          user.displayAvatarURL({ size: 2048, extension: "png" })
        );
        ctx.drawImage(avatar, x - 100, y + 90, 86, 86);
        ctx.restore();
      }

      let layout = await loadImage(
        "https://media.discordapp.net/attachments/1095160087267520542/1095376634737074306/1681228521729.png?width=512&height=597"
      );
      ctx.drawImage(layout, 0, 0, image.width, image.height);
      let j = 0;

      for (let i = 0; i < users.length; i++) {
        let y = 93 * i,
          x = 155,
          position = j++ * 90;

        let user = await this.client.users.fetch(users[i].id);

        ctx.save();
        ctx.font = user.tag.length >= 15 ? "13px cool" : "22px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(ctx, user.tag, x, y + 120);

        ctx.font = "21px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(
          ctx,
          `#${String(i + (page + 1))}`,
          x + 254,
          y + 106
        );

        ctx.font = "10px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(ctx, "ID: " + user.id, x, y + 134);

        ctx.font = "25px cool";
        ctx.fillStyle = "#F8F8F8";
        await fillTextWithTwemoji(
          ctx,
          users[i].dataValues.curtidas.toLocaleString("de-DE") + " Curtidas",
          x,
          y + 160
        );
        ctx.restore();
      }

      let attachment = new AttachmentBuilder(
        image.toBuffer(),
        "leaderboard.png"
      );

      await message.reply({
        content: message.author.toString(),
        files: [attachment],
      });
    }
  }
}
