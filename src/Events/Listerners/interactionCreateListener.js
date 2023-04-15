import client from "../../../index.js";
import SQL from "sequelize";
import { ApplicationCommandOptionType } from "discord.js";

client.on("interactionCreate", async (interaction) => {
  const prefix = "/";

  if (interaction.commandType === 1) {
    const { commandName } = interaction;
    let cmd = client.slashCommands.get(commandName);

    if (!cmd)
      return interaction.editReply(
        `${client.emoji.error} **-** ${interaction.user}, Não achei nenhum comando relacionado a \`${CommandName}\` em minha memória interna.`
      );

    interaction.deferReply();

    const args = [];
    for (let option of interaction.options.data) {
      if (option.type === ApplicationCommandOptionType.Subcommand) {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }

    let userdb = await client.db.users.findOrCreate({
      where: { id: interaction.user.id },
    });

    let clientdata = await client.db.users.findOrCreate({
      where: { id: client.user.id },
    });

    let clientdb = await client.db.ruffle.findOrCreate({
      where: { id: client.user.id },
    });

    /*
    if (!clientdata) {
      return client.db.users.findOrCreate({
        where: { id: client.user.id },
      });
    }
    */

    let verificado = await client.db.users
      .findOne({ where: { id: interaction.user.id } })
      .then((data) => data.dataValues.verify);

    if (!userdb) {
      return client.db.users.findOrCreate({
        where: { id: interaction.user.id },
      });
    }

    let banidos = await client.db.users
      .findOne({ where: { id: interaction.user.id } })
      .then((data) => data.dataValues.ban);

    let mot = await client.db.users
      .findOne({ where: { id: interaction.user.id } })
      .then((data) => data.dataValues.motiveban);

    let day = await client.db.users
      .findOne({ where: { id: interaction.user.id } })
      .then((data) => data.dataValues.dateban);

    if (banidos)
      return interaction.editReply({
        content: `👮 **-** Mãos para o alto! ${interaction.user}, você está banido de utilizar meus comandos!\n> 📝 **-** Motivo: \`${mot}\`\n> ⏱️ **-** Dia: <t:${day}:F>`,
        ephemeral: true,
      });

    if (verificado == false) {
      interaction
        .editReply({
          content: `${client.emoji.error} **-** ${interaction.user}, hm... me parece que você ainda não é verificado na minha database.`,
        })
        .then((msg) => {
          msg.edit({
            content: `<a:load:993255438730661918> **-** Configurando seu perfil...`,
          });

          setTimeout(async () => {
            interaction.editReply({
              content: `${client.emoji.correct} **-** Prontinho! ${interaction.user}, você foi registrado com sucesso na minha database, por favor utilize o comando novamente.`,
            });

            await client.db.users.update(
              {
                verify: true,
              },
              {
                where: { id: interaction.user.id }, //qual linha vai atualizar vc coloca dentro de "where"
              }
            );
          }, 7000);
          return;
        });
      return;
    }

    await client.db.users.update(
      { command: SQL.literal("command + 1") },
      {
        where: { id: client.user.id },
      }
    );

    await client.db.users.update(
      { command: SQL.literal("command + 1") },
      {
        where: { id: interaction.user.id },
      }
    );

    try {
      await cmd.run(interaction, prefix, args);
    } catch (e) {
      console.log(e);

      interaction.editReply({
        content: `${client.emoji.error} **-** ${interaction.user}, o comando não funcionou parece que deu um erro! caso persista entre em meu suporte https://penguinbot.online/suporte \n\`${e.message}\``,
        ephemeral: true,
      });
    }
  }
});
