import client from "../../../index.js";
import { ActivityType } from "discord.js";
import ms from "ms";
import { random } from "undefined_package";

client.on("ready", async () => {
  console.log(`[CLIENTE] - Conectado com sucesso em ${client.user.tag}!`);

  setInterval(async () => {
    let cluster = random(["3", "2", "1"]);
    let status = random([
      `https://penguinbot.online/ | Cluster 1 [${client.guilds.cache.size}]`,
      `p!help | Cluster 1 [${client.guilds.cache.size}]`,
      `Entre no meu servidor! | Cluster 1 [${client.guilds.cache.size}]`,
    ]);

    client.user.setActivity(`${status}`, {
      type: ActivityType.Playing,
    });
  }, 60000);

  client.user.presence.set({ status: "online" });
});

client.on("ready", async () => {
  setInterval(async () => {
    let usersallbot = client.users.cache.map((a) => a.id);

    usersallbot.forEach(async (pessoa) => {
      let usersalldb = await client.db.users.findOne({
        where: { id: pessoa },
      });
      if (!usersalldb) return;

      if (usersalldb.dataValues.lembreteDaily === true) {
        let temporestante1 = parseInt(usersalldb.dataValues.daily);
        let temporestante = temporestante1 - Date.now();

        if (Date.now() < usersalldb.dataValues.daily) return;

        await client.db.users.update(
          {
            lembreteDaily: false,
          },
          {
            where: { id: pessoa },
          }
        );

        let userfetch = await client.users.fetch(pessoa).catch((a) => null);
        let canaldaily = usersalldb.dataValues.channelDaily;

        return userfetch
          .send(
            `🔔 **-** ei ${userfetch}, você já pode resgatar seu daily novamente!`
          )
          .catch(async (e) => {
            let canaldailyfetch = await client.channels.cache.get(
              `${canaldaily}`
            );
            if (!canaldailyfetch) return;
            return canaldailyfetch
              .send(
                `🔔 **-** ei ${userfetch}, você já pode resgatar seu daily novamente!`
              )
              .catch((e) => null);
          });
      }
      if (usersalldb.dataValues.lembreteWork === true) {
        let temporestante1 = parseInt(usersalldb.dataValues.work);
        let temporestante = temporestante1 - Date.now();
        if (Date.now() < usersalldb.dataValues.work) return;

        await client.db.users.update(
          {
            lembreteWork: false,
          },
          {
            where: { id: pessoa },
          }
        );

        let userfetch = await client.users.fetch(pessoa).catch((a) => null);
        let canaldaily = usersalldb.dataValues.channelWork;

        return userfetch
          .send(
            `🔔 **-** ei ${userfetch}, você já pode trabalhar novamente e receber recompensas!`
          )
          .catch(async (e) => {
            let canaldailyfetch = await client.channels.cache.get(
              `${canaldaily}`
            );
            if (!canaldailyfetch) return;
            return canaldailyfetch
              .send(
                `🔔 **-** ei ${userfetch}, você já pode trabalhar novamente e receber recompensas`
              )
              .catch((e) => null);
          });
      }
      if (usersalldb.dataValues.lembreteVic === true) {
        let temporestante1 = parseInt(usersalldb.dataValues.vic);
        let temporestante = temporestante1 - Date.now();

        if (Date.now() < usersalldb.dataValues.vic) return;
        await client.db.users.update(
          {
            lembreteVic: false,
          },
          {
            where: { id: pessoa },
          }
        );

        let userfetch = await client.users.fetch(pessoa).catch((a) => null);
        let canaldaily = usersalldb.dataValues.channelVic;

        return userfetch
          .send(
            `🔔 **-** ei ${userfetch}, você já pode resgatar seu prêmio vip novamente!`
          )
          .catch(async (e) => {
            let canaldailyfetch = await client.channels.cache.get(
              `${canaldaily}`
            );
            if (!canaldailyfetch) return;
            return canaldailyfetch
              .send(
                `🔔 **-** ei ${userfetch}, você já pode resgatar seu prêmio vip novamente!`
              )
              .catch((e) => null);
          });
      }
      if (usersalldb.dataValues.lembreteCrime === true) {
        let temporestante1 = parseInt(usersalldb.dataValues.crime);
        let temporestante = temporestante1 - Date.now();

        if (Date.now() < usersalldb.dataValues.crime) return;
        await client.db.users.update(
          {
            lembreteCrime: false,
          },
          {
            where: { id: pessoa },
          }
        );

        let userfetch = await client.users.fetch(pessoa).catch((a) => null);
        let canaldaily = usersalldb.dataValues.channelCrime;

        userfetch
          .send(
            `🔔 **-** ei ${userfetch}, você já pode cometer um crime novamente!`
          )
          .catch(async (e) => {
            let canaldailyfetch = await client.channels.cache.get(
              `${canaldaily}`
            );
            if (!canaldailyfetch) return;
            canaldailyfetch
              .send(
                `🔔 **-** ei ${userfetch}, você já pode cometer um crime novamente!`
              )
              .catch((e) => null);
          });
      }
    });
  }, ms("15s"));
});
