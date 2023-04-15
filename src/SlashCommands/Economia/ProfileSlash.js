import SlashCommand from "../../Structures/base/SlashCommand.js";
import client from "../../../index.js";
import Discord from "discord.js";
import Canvas from "canvas";
import ms from "ms";
import SQl from "sequelize";

import { registerFont } from "canvas";
registerFont("./src/Fonts/Font.otf", { family: "Uniform" });

export default class ProfileSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "perfil",
      description: "「Economia」veja o seu perfil ou de algum usuário.",
      type: Discord.ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "mencione o usuário que deseja ver o perfil.",
          type: Discord.ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      help: {
        usage: "/perfil [@user]",
      },
    });
  }

  async run(interaction) {
    const prefixo = "/";
    const user = interaction.options.getUser("user") || interaction.user;
    //await interaction.deferReply({ ephemeral: false });
    send();

    async function send(param) {
      const userdb = await client.db.users.findOne({
        where: { id: user.id },
      });
      if (!userdb) {
        return interaction.editReply({
          content: `${client.emoji.error} **-** ${interaction.user}, o usuário mencionado não está registrado em minha database.`,
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
        "https://media.discordapp.net/attachments/925197642668052550/1030609558529384500/aeaeae-3.png"
      );
      ctx.drawImage(layout, 0, 0, canvas.width, canvas.height);

      ctx.font = user.tag.length >= 20 ? "20px cool" : "30px cool";
      ctx.fillStyle = "#F8F8F8";
      ctx.fillText(`${user.tag}`, user.tag.lenght >= 15 ? 37 : 20, 37);

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
          `${marryUser.username}`,
          690 - marryUser.username.length * 7.4,
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
      ctx.drawImage(userAvatar, 45, 45, 218, 218); //45, 45, 218, 218

      const attachment = new Discord.AttachmentBuilder(
        canvas.toBuffer(),
        "perfil.png"
      );

      const db = await client.db.users.findOne({
        where: { id: interaction.user.id },
      });

      let a = false;
      if (user.id === interaction.user.id) {
        a = false;
      } else {
        a = true;
      }

      let u = false;
      if (user.id === interaction.user.id) {
        u = true;
      } else if (user.id !== interaction.user.id) {
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
              user.id === interaction.user.id
                ? `${interaction.user}`
                : `${interaction.user}, perfil de \`${user.tag}\`!`
            }`,
            files: [attachment],
            components: user.id === interaction.user.id ? [button2] : [button],
            fetchReply: true,
          })
        : await interaction.editReply({
            content: `${
              user.id === interaction.user.id
                ? `${interaction.user}`
                : `${interaction.user}, perfil de \`${user.tag}\`!`
            }`,
            files: [attachment],
            components: user.id === interaction.user.id ? [button2] : [button],
            fetchReply: true,
          }); //envia a msg, lembre de por fetchReply

      //coletor...
      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: ms("5m"),
        max: 1,
      });

      collector.on("collect", async (x) => {
        x.deferUpdate();

        if (x.user.id !== interaction.user.id) return;

        switch (x.customId) {
          case "rep":
            if (Date.now() < userdb.dataValues.rep) {
              const calc = userdb.dataValues.rep - Date.now();

              const data = ~~((Date.now() + calc) / 1000);

              return interaction.editReply({
                content: `${client.emoji.temp} **-** ${interaction.user}, você poderá executar este comando novamente em <t:${data}> **(**<t:${data}:R>**)**.`,
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
                  where: { id: interaction.user.id },
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

              interaction.followUp({
                content: `${client.emoji.correct} ${interaction.user}, você adicionou com sucesso uma reputação ao usuário \`${user.tag}\`, que agora possuí **${c}**!`,
                components: [],
                ephemeral: true,
              });
            }
            break;
          case "sobre":
            interaction
              .followUp(
                `Olá ${interaction.user}, me parece que você deseja mudar sua biografia, para mudar basta mandar no chat oque você deseja colocar em se sobre mim.`
              )
              .then((msl) => {
                let coletor = interaction.channel.createMessageCollector({
                  filter: (mm) => mm.author.id == interaction.user.id,
                  max: 1,
                });

                coletor.on("collect", async (bug) => {
                  const b = bug.content;

                  if (b.lenght >= 192) {
                    return interaction.followUp(
                      `${client.emoji.error}, você só pode adicionar até **192** caracteres em sua mensagem.`
                    );
                  }

                  await client.db.users.update(
                    {
                      sobremim: b,
                    },
                    {
                      where: { id: interaction.user.id },
                    }
                  );

                  await send(msg);

                  interaction.followUp(
                    `${client.emoji.correct} **-** ${interaction.user}, sua biografia foi modificada com sucesso!`
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
