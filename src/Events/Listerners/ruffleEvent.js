import client from "../../../index.js";
import { EmbedBuilder } from "discord.js";
import SQL from "sequelize";

client.on("ready", async () => {
  setInterval(async () => {
    let userC = await client.db.ruffle.findOne({
      where: { id: client.user.id },
    });
    if (!userC) return;

    if (userC.dataValues.rifausers.length >= 1) {
      if (userC.dataValues.rifatime <= Date.now()) {
        var winner =
          userC.dataValues.rifausers[
            Math.floor(Math.random() * userC.dataValues.rifausers.length)
          ];

        let hora = parseInt(Date.now() + 3600000)
        const ganhador = await client.users.fetch(winner);
        let valor = userC.dataValues.rifavalue

        const channel = await client.channels.fetch("925197642668052550");

        const w = await client.db.users.findOne({
          where: { id: ganhador.id },
        });

        let win = new EmbedBuilder()
          .setDescription(
            `> 🏆 **-** Ganhador: \`${ganhador.tag} (${ganhador.id})\`\n> 💸 **-** Prêmio recebido: **${userC.dataValues.rifavalue} Gelitos**\n> 👥 **-** Pessoas que participaram: **${userC.dataValues.rifausers.length} Pessoas**\n> 🎫 **-** Tickets comprados: **${userC.dataValues.rifabilhete} Tickets**`
          )
          .setColor("Aqua")
          .setThumbnail(ganhador.displayAvatarURL({ dynamic: true }));

        ganhador.send({
          content: `${ganhador}, parabéns você ganhou a rifa!`,
          embeds: [win],
        });

        channel.send({
          content: `A rifa acabou o vencedor foi o usuário \`${ganhador.tag} (${ganhador.id})\`, com isso ele levou pra casa um valor de **${userC.dataValues.rifavalue} Gelitos**!`,
        });

        /*
        let t = w.economia.tr;
        if (!t) t = [];

        t.unshift(
          `[<t:${Date.now() / 1000}:d> <t:${
            Date.now() / 1000
          }:t>] 📥 **|** Recebeu **${userC.rifa.coins.toLocaleString(
            "en-US"
          )} Gelitos** na PenguinLand Rifa.`
        );
        
        await client.db.users.findOneAndUpdate(
          { userID: ganhador.id },
          {
            $set: {
              "economia.money": w.economia.money + userC.rifa.coins,
              "economia.tr": t,
            },
          }
        );
        */

        await this.client.db.users.update(
          { money: SQL.literal(`money + ${valor}`) },
          {
            where: { id: ganhador.id },
          }
        );


        await client.db.ruffle.update(
          {
            rifatime: parseInt(hora)
          },
          {
            where: { id: client.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
          }
        );

        await client.db.ruffle.update(
          {
            rifabilhete: 0
          },
          {
            where: { id: client.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
          }
        );

        await client.db.ruffle.update(
          {
            rifaganhador: `${ganhador.tag} (${ganhador.id})`
          },
          {
            where: { id: client.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
          }
        );

        await client.db.ruffle.update(
          {
            rifavalue: 0
          },
          {
            where: { id: client.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
          }
        );

        await client.db.ruffle.update(
          {
            rifausers: []
          },
          {
            where: { id: client.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
          }
        );

        /*
        rifausers: [],
            rifabilhete: 0,
            rifaganhador: `${ganhador.tag} (${ganhador.id})`,
            rifavalor: 0,
            */
      }
    } else {
      let hora = parseInt(Date.now() + 3600000)
      await client.db.ruffle.update(
        { rifatime: parseInt(hora) },
        {
          where: { id: client.user.id },
        }
      );
    }
  }, 16000);
});
