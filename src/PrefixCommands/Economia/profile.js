import Command from "../../Structures/base/Command.js";
import client from "../../../index.js";
import Discord from "discord.js";
import Canvas from "canvas";
import ms from "ms";
import SQl from "sequelize";
import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";

import { registerFont } from "canvas";
registerFont("./src/Fonts/Font.otf", { family: "Uniform" });

export default class ProfileCommand extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "「Economia」veja o seu perfil ou de algum usuário.",
      type: Discord.ApplicationCommandType.ChatInput,
      aliases: ["perfil"],
      help: {
        usage: "{prefix}perfil [@user]",
      },
    });
  }

  async run(message, args, prefix) {
    const prefixo = prefix;
    const user =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;

    const userData = await client.db.users.findOne({
      where: { id: user.id },
    });
    //await interaction.deferReply({ ephemeral: false });
    send();

    async function send(param) {
      const userdb = await client.db.users.findOne({
        where: { id: user.id },
      });
      if (!userdb) {
        return message.reply({
          content: `${client.emoji.error} **-** ${message.author}, o usuário mencionado não está registrado em minha database.`,
          ephemeral: true,
        });
      }

      let bg =
        userdb.dataValues.bgatual ||
        "https://cdn.discordapp.com/attachments/1006035026967801916/1029520334602387506/images_5.jpg";

      const canvas = Canvas.createCanvas(850, 550);
      const ctx = canvas.getContext("2d");

      const background = await Canvas.loadImage(`${bg}`);

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const layout = await Canvas.loadImage(
        "https://media.discordapp.net/attachments/1091937395231957214/1096836612266143744/1681576612786.png?width=923&height=597"
      );
      ctx.drawImage(layout, 0, 0, canvas.width, canvas.height);

      ctx.font = user.tag.length >= 20 ? "20px cool" : "27px cool";
      ctx.fillStyle = "#F8F8F8";
      ctx.fillText(`${user.tag}`, user.tag.lenght >= 20 ? 37 : 20, 37);

      let list = [];
      let flag = user.flags.toArray();

      if (user.id === "1013984561153200209")
        list.push("<:VerifiedDeveloper:1096594401628799076>");
      if (Date.now() < userData.dataValues.vip)
        list.push("<:vip:1096813889536135178>");
      if (userData.dataValues.staff == true)
        list.push("<:Staff:1096592821160517704>");
      if (flag.includes("ActiveDeveloper"))
        list.push("<:ActiveDeveloper:1096595624721395772>");
      if (flag.includes("HypeSquad"))
        list.push("<:HypeSquad:787775258706182154>");
      if (flag.includes("BugHunterLevel1"))
        list.push("<:BugHunterLevel1:991512053690937424>");
      if (flag.includes("HypeSquadOnlineHouse1"))
        list.push("<:HypeSquadHouse2:1096592660254433412>");
      if (flag.includes("HypeSquadOnlineHouse2"))
        list.push("<:HypeSquadHouse1:1096592740650852454>");
      if (flag.includes("HypeSquadOnlineHouse3"))
        list.push("<:HypeSquadOnlineHouse3:1096595217748086804>");
      if (flag.includes("PremiumEarlySupporter"))
        list.push("<:PremiumEarlySupporter:1096593206302490664>");
      if (flag.includes("BugHunterLevel2"))
        list.push("<:BugHunterLevel2:1096593731081211914>");
      if (flag.includes("VerifiedDeveloper"))
        list.push("<:VerifiedDeveloper:1096594401628799076>");
      if (flag.includes("CertifiedModerator"))
        list.push("<:CertifiedModerator:1096594669170856066>");
      if (flag.includes("128")) list.push("<:Nitro:1096607912467632219>");

      /*
      const flags = {
      Staff: `1`,
      Partner: `2`,
      Hypesquad: `3`,
      BugHunterLevel1: `4`,
      MFASMS: "5",
      PremiumPromoDismissed: "6",
      HypeSquadOnlineHouse1: `7`,
      HypeSquadOnlineHouse2: `8`,
      HypeSquadOnlineHouse3: `9`,
      PremiumEarlySupporter: `10`,
      TeamPseudoUser: "11",
      HasUnreadUrgentMessages: "12",
      BugHunterLevel2: `13`,
      VerifiedBot: "14",
      VerifiedDeveloper: `15`,
      CertifiedModerator: `16`,
      BotHTTPInteractions: "17",
      Spammer: "18",
      DisablePremium: "19",
      ActiveDeveloper: `20`,
      Quarantined: "21",
      Collaborator: "22",
      RestrictedCollaborator: "21",
    };*/

      ctx.font = "33px Uniform";

      await fillTextWithTwemoji(ctx, list.join(""), 110, 420);

      ctx.font = "22px Uniform";
      ctx.fillStyle = "#F8F8F8";
      ctx.fillText(
        `${userdb.dataValues.sobremim
          .slice(0, 64)
          .replace(
            "`{prefix}`",
            `${prefixo}sobremim`
          )}\n${userdb.dataValues.sobremim
          .slice(64, 128)
          .replace(
            "`{prefix}`",
            `${prefixo}sobremim`
          )}\n${userdb.dataValues.sobremim
          .slice(128, 192)
          .replace("`{prefix}`", `${prefixo}sobremim`)}`,
        60,
        495
      );

      ctx.font = "23px Uniform";
      ctx.fillStyle = "#F8F8F8";
      ctx.fillText(`: ${abreviar(userdb.dataValues.money)}`, 713, 230);
      ctx.fillText(`: ${abreviar(userdb.dataValues.curtidas)}`, 723, 263);

      ctx.save();

      if (userdb.dataValues.marry) {
        const img = await Canvas.loadImage("https://i.imgur.com/JI5SfCN.png");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const marryUser = await client.users.fetch(userdb.dataValues.usermarry);

        ctx.font = "20px Uniform";
        ctx.fillStyle = "#F8F8F8";
        ctx.fillText(
          `${marryUser.tag}`,
          690 - marryUser.tag.length * 7.4,
          74
        );

        
        const avatarUser = marryUser.displayAvatarURL({
          forceStatic: true,
          extension: "png",
          size: 1024,
        });

        ctx.beginPath();
        ctx.arc(688, 111, 33, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const marryAvatar = await Canvas.loadImage(`${avatarUser}`);
        ctx.drawImage(marryAvatar, 656, 79, 65, 65);
        
      }

      ctx.restore();

      ctx.beginPath();
      ctx.arc(206, 100, 53, 4.7, Math.PI * 0);
      ctx.arc(206, 205, 53, 6.35, Math.PI * 0.52);
      ctx.arc(101, 205, 53, 1.65, Math.PI * 1);
      ctx.arc(101, 100, 53, 3.3, Math.PI * 1.5);
      ctx.closePath();
      ctx.clip();

      const avatar = user.displayAvatarURL({
        forceStatic: true,
        extension: "png",
        size: 1024,
      });

      const userAvatar = await Canvas.loadImage(`${avatar}`);
      ctx.beginPath();
      ctx.arc(150, 148, 98, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(userAvatar, 45, 30, 218, 218); //45, 45, 218, 218

      const attachment = new Discord.AttachmentBuilder(
        canvas.toBuffer(),
        "profile.png"
      );

      const db = await client.db.users.findOne({
        where: { id: message.author.id },
      });

      let a = false;
      if (user.id === message.author.id) {
        a = false;
      } else {
        a = true;
      }

      let u = false;
      if (user.id === message.author.id) {
        u = true;
      } else if (user.id !== message.author.id) {
        u = false;
      }
      if (Date.now() < db.dataValues.rep) {
        u = true;
      }

      const button = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setLabel("Enviar reputação")
          .setStyle(Discord.ButtonStyle.Success)
          .setEmoji("♥️")
          .setDisabled(u)
          .setCustomId("rep")
      );

      const button2 = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setLabel("Sobre mim")
          .setStyle(Discord.ButtonStyle.Success)
          .setEmoji("📝")
          .setCustomId("sobre")
          .setDisabled(a)
      );

      let msg = param
        ? param.edit({
            content: `${
              user.id === message.author.id
                ? `${message.author}`
                : `${message.author}, perfil de \`${user.tag}\`!`
            }`,
            files: [attachment],
            components: user.id === message.author.id ? [button2] : [button],
            fetchReply: true,
          })
        : await message.reply({
            content: `${
              user.id === message.author.id
                ? `${message.author}`
                : `${message.author}, perfil de \`${user.tag}\`!`
            }`,
            files: [attachment],
            components: user.id === message.author.id ? [button2] : [button],
            fetchReply: true,
          }); //envia a msg, lembre de por fetchReply

      //coletor...
      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };
      const collector = message.channel.createMessageComponentCollector({
        filter,
        time: ms("5m"),
        max: 1,
      });

      collector.on("collect", async (x) => {
        x.deferUpdate();

        if (x.user.id !== message.author.id) return;

        switch (x.customId) {
          case "rep":
            if (Date.now() < userdb.dataValues.rep) {
              const calc = userdb.dataValues.rep - Date.now();

              const data = ~~((Date.now() + calc) / 1000);

              return message.reply({
                content: `${client.emoji.temp} **-** ${message.author}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
                ephemeral: true,
              });
            } else {
              const userdb2 = await client.db.users.findOne({
                where: { id: user.id },
              });
              const curtidasUser = parseInt(userdb2.dataValues.curtidas);
              const c = curtidasUser + 1;
              const Hora = Date.now() + ms("1h");

              await client.db.users.update(
                {
                  rep: parseInt(Hora),
                },
                {
                  where: { id: message.author.id },
                }
              );

              await client.db.users.update(
                {
                  curtidas: c,
                },
                {
                  where: { id: user.id },
                }
              );

              await send(msg);

              message.reply({
                content: `${client.emoji.correct} ${message.author}, você adicionou com sucesso uma reputação ao usuário \`${user.tag}\`, que agora possuí **${c}**!`,
                components: [],
                ephemeral: true,
              });
            }
            break;
          case "sobre":
            message
              .reply(
                `Olá ${message.author}, me parece que você deseja mudar sua biografia, para mudar basta mandar no chat oque você deseja colocar em se sobre mim.`
              )
              .then((msl) => {
                let coletor = message.channel.createMessageCollector({
                  filter: (mm) => mm.author.id == message.author.id,
                  max: 1,
                });

                coletor.on("collect", async (bug) => {
                  const b = bug.content;

                  if (b.lenght >= 192) {
                    return message.reply(
                      `${client.emoji.error}, você só pode adicionar até **192** caracteres em sua mensagem.`
                    );
                  }

                  await client.db.users.update(
                    {
                      sobremim: b,
                    },
                    {
                      where: { id: message.author.id },
                    }
                  );

                  await send(msg);

                  message.reply(
                    `${client.emoji.correct} **-** ${message.author}, sua biografia foi modificada com sucesso!`
                  );
                });
              });
            break;
        }
      });
    }
  }
}

function abreviar(number, precision = 2) {
  return number.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: precision,
  });
}
