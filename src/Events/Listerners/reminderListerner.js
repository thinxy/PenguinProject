import client from "../../../index.js";
import {
  InteractionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("lwork-")) {
      await interaction.deferUpdate({ ephemeral: true });

      let sptl1 = `${interaction.customId}`.split("-");
      if (interaction.user.id !== sptl1[1]) return;
      if (Date.now() > sptl1[2]) return;

      let databaseuser = await client.db.users.findOne({
        where: { id: interaction.user.id },
      });

      if (databaseuser.dataValues.lembreteWork === true)
        return interaction.followUp({
          content: `${client.emoji.error} **-** ${interaction.user}, seu lembrete já está ativado, não é possível ativar mais de uma vez enquanto não estiver pronto.`,
          ephemeral: true,
        });

      await client.db.users.update(
        {
          lembreteWork: true,
        },
        {
          where: { id: interaction.user.id },
        }
      );

      const calc = databaseuser.dataValues.work - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      interaction.followUp({
        content: `${client.emoji.correct} **-** ${interaction.user}, seu lembrete foi ativado com sucesso, irei te lembrar ás <t:${data}>.`,
        ephemeral: true,
      });

      let btd = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setCustomId(`lwork`)
          .setLabel("Lembrete Ativado")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Success)
      );

      interaction.message.edit({ components: [btd] });

      /*
      let temporestante1 = Date.now();
      let temporestante = databaseuser.dataValues.work - temporestante1;


      console.log(temporestante);

      setTimeout(async () => {
        await client.db.users.update(
        {
          lembreteWork: false,
        },
        {
          where: { id: interaction.user.id },
        });

        let userfetch = await client.users
          .fetch(interaction.user.id)
          .catch((a) => null);
        let canaldaily = databaseuser.dataValues.channelWork;

        userfetch
          .send(
            `🔔 **-** ei ${interaction.user}, você já pode trabalhar novamente e receber recompensas!`
          )
          .catch(async (e) => {
            let canaldailyfetch = await client.channels.cache.get(
              `${canaldaily}`
            );
            if (!canaldailyfetch) return;
            canaldailyfetch
              .send(
                `🔔 **-** ei ${interaction.user}, você já pode trabalhar novamente e receber recompensas!`
              )
              .catch((e) => null);
          });
      }, temporestante);
    }
    */
    }
    if (interaction.customId.startsWith("ldaily-")) {
      await interaction.deferUpdate({ ephemeral: true });

      let sptl1 = `${interaction.customId}`.split("-");
      if (interaction.user.id !== sptl1[1]) return;
      if (Date.now() > sptl1[2]) return;

      let databaseuser = await client.db.users.findOne({
        where: { id: interaction.user.id },
      });

      if (databaseuser.dataValues.lembreteDaily === true)
        return interaction.followUp({
          content: `${client.emoji.error} **-** ${interaction.user}, seu lembrete já está ativado, não é possível ativar mais de uma vez enquanto não estiver pronto.`,
          ephemeral: true,
        });

      await client.db.users.update(
        {
          lembreteDaily: true,
        },
        {
          where: { id: interaction.user.id },
        }
      );

      const calc = databaseuser.dataValues.daily - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      interaction.followUp({
        content: `${client.emoji.correct} **-** ${interaction.user}, seu lembrete foi ativado com sucesso, irei te lembrar ás <t:${data}>.`,
        ephemeral: true,
      });

      let btd = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setCustomId(`ldaily`)
          .setLabel("Lembrete Ativado")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Success)
      );

      interaction.message.edit({ components: [btd] });

      /*
    let temporestante1 = Date.now();
    let temporestante = databaseuser.dataValues.daily - temporestante1;

    console.log(temporestante);

    setTimeout(async () => {
      await client.db.users.update(
      {
        lembreteDaily: false,
      },
      {
        where: { id: interaction.user.id },
      });

      let userfetch = await client.users
        .fetch(interaction.user.id)
        .catch((a) => null);
      let canaldaily = databaseuser.dataValues.channelDaily;

      userfetch
        .send(
          `🔔 **-** ei ${interaction.user}, você já pode resgatar seu daily novamente!`
        )
        .catch(async (e) => {
          let canaldailyfetch = await client.channels.cache.get(
            `${canaldaily}`
          );
          if (!canaldailyfetch) return;
          canaldailyfetch
            .send(
              `🔔 **-** ei ${interaction.user}, você já pode resgatar seu daily novamente!`
            )
            .catch((e) => null);
        });
    }, temporestante);
    */
    }
    if (interaction.customId.startsWith("lcrime-")) {
      await interaction.deferUpdate({ ephemeral: true });

      let sptl1 = `${interaction.customId}`.split("-");
      if (interaction.user.id !== sptl1[1]) return;
      if (Date.now() > sptl1[2]) return;

      let databaseuser = await client.db.users.findOne({
        where: { id: interaction.user.id },
      });

      if (databaseuser.dataValues.lembreteCrime === true)
        return interaction.followUp({
          content: `${client.emoji.error} **-** ${interaction.user}, seu lembrete já está ativado, não é possível ativar mais de uma vez enquanto não estiver pronto.`,
          ephemeral: true,
        });

      await client.db.users.update(
        {
          lembreteCrime: true,
        },
        {
          where: { id: interaction.user.id },
        }
      );

      const calc = databaseuser.dataValues.crime - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      interaction.followUp({
        content: `${client.emoji.correct} **-** ${interaction.user}, seu lembrete foi ativado com sucesso, irei te lembrar ás <t:${data}>.`,
        ephemeral: true,
      });

      let btd = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setCustomId(`lcrime`)
          .setLabel("Lembrete Ativado")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Success)
      );

      interaction.message.edit({ components: [btd] });
      /*
    let temporestante1 = Date.now();
    let temporestante = databaseuser.dataValues.crime - temporestante1;

    console.log(temporestante);

    setTimeout(async () => {
      await client.db.users.update(
      {
        lembreteCrime: false,
      },
      {
        where: { id: interaction.user.id },
      });

      let userfetch = await client.users
        .fetch(interaction.user.id)
        .catch((a) => null);
      let canaldaily = databaseuser.dataValues.channelCrime;

      userfetch
        .send(
          `🔔 **-** ei ${interaction.user}, você já pode resgatar seu daily novamente!`
        )
        .catch(async (e) => {
          let canaldailyfetch = await client.channels.cache.get(
            `${canaldaily}`
          );
          if (!canaldailyfetch) return;
          canaldailyfetch
            .send(
              `🔔 **-** ei ${interaction.user}, você já pode resgatar seu daily novamente!`
            )
            .catch((e) => null);
        });
    }, temporestante);
    */
    }
    if (interaction.customId.startsWith("lvic-")) {
      await interaction.deferUpdate({ ephemeral: true });

      let sptl1 = `${interaction.customId}`.split("-");
      if (interaction.user.id !== sptl1[1]) return;
      if (Date.now() > sptl1[2]) return;

      let databaseuser = await client.db.users.findOne({
        where: { id: interaction.user.id },
      });

      if (databaseuser.dataValues.lembreteVic === true)
        return interaction.followUp({
          content: `${client.emoji.error} **-** ${interaction.user}, seu lembrete já está ativado, não é possível ativar mais de uma vez enquanto não estiver pronto.`,
          ephemeral: true,
        });

      await client.db.users.update(
        {
          lembreteVic: true,
        },
        {
          where: { id: interaction.user.id },
        }
      );

      const calc = databaseuser.dataValues.vic - Date.now();

      const data = ~~((Date.now() + calc) / 1000);

      interaction.followUp({
        content: `${client.emoji.correct} **-** ${interaction.user}, seu lembrete foi ativado com sucesso, irei te lembrar ás <t:${data}>.`,
        ephemeral: true,
      });

      let btd = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setCustomId(`lvic`)
          .setLabel("Lembrete Ativado")
          .setEmoji(`🔔`)
          .setStyle(ButtonStyle.Success)
      );

      interaction.message.edit({ components: [btd] });
      /*
    let temporestante1 = Date.now();
    let temporestante = databaseuser.dataValues.vic - temporestante1;

    console.log(temporestante);

    setTimeout(async () => {
      await client.db.users.update(
      {
        lembreteVic: false,
      },
      {
        where: { id: interaction.user.id },
      });

      let userfetch = await client.users
        .fetch(interaction.user.id)
        .catch((a) => null);
      let canaldaily = databaseuser.dataValues.channelVic;

      userfetch
        .send(
          `🔔 **-** ei ${interaction.user}, você já pode resgatar seu vip-claim novamente!`
        )
        .catch(async (e) => {
          let canaldailyfetch = await client.channels.cache.get(
            `${canaldaily}`
          );
          if (!canaldailyfetch) return;
          canaldailyfetch
            .send(
              `🔔 **-** ei ${interaction.user}, você já pode resgatar seu vip-claim novamente!`
            )
            .catch((e) => null);
        });
    }, temporestante);
    */
    }
  }
});
