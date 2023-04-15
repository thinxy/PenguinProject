import client from "../../../index.js";
import sql from "sequelize";

client.on("messageCreate", async (message) => {
  if (!message.guild || message.bot) return;

  const guildb = await client.db.guilds.findOne({
    where: { id: message.guild.id },
  });
  if (!guildb) {
    return await client.db.guilds.findOrCreate({
      where: { id: message.guild.id },
    });
  }

  const prefix = guildb.dataValues.prefixo || "p!";
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g),
    cmd = args.shift().toLowerCase();
  let command =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!command) return;

  let userdb = await client.db.users.findOne({
    where: { id: message.author.id },
  });

  let clientdb = await client.db.users.findOrCreate({
    where: { id: client.user.id },
  });
  if (!userdb) {
    return await client.db.users.findOrCreate({
      where: { id: message.author.id },
    });
  }

  let verificado = await client.db.users
    .findOne({ where: { id: message.author.id } })
    .then((data) => data.dataValues.verify);

  if (verificado == false) {
    message
      .reply({
        content: `${client.emoji.error} **-** ${message.author}, hm... me parece que você ainda não é verificado na minha database.`,
      })
      .then((msg) => {
        msg.edit({
          content: `<a:load:993255438730661918> **-** Configurando seu perfil...`,
        });

        setTimeout(async () => {
          msg.edit({
            content: `${client.emoji.correct} **-** Prontinho! ${message.author}, você foi registrado com sucesso na minha database, por favor utilize o comando novamente.`,
          });

          await client.db.users.update(
            {
              verify: true,
            },
            {
              where: { id: message.author.id }, //qual linha vai atualizar vc coloca dentro de "where"
            }
          );
        }, 7000);
        return;
      });
    return;
  }

  await client.db.users.update(
    {
      comando: parseInt(Date.now() + 5000),
      command: sql.literal("command + 1"),
    },
    {
      where: { id: message.author.id },
    }
  );

  await client.db.users.update(
    { command: sql.literal("command + 1") },
    {
      where: { id: client.user.id },
    }
  );

  let t1 = parseInt(userdb.dataValues.comando);
  let t = t1;

  if (Date.now() < userdb.dataValues.comando) {
    return message.reply(
      `${client.emoji.error} **-** ${
        message.author
      }, você está utilizando os meus comandos muito rapido, por favor espere **${
        ms(t).seconds
      } segundos** para utilizar os meus comandos.`
    );
  }

  try {
    command.run(message, args, prefix);
  } catch (e) {
    console.log(e);

    return message.reply({
      content: `${client.emoji.error} **-** ${message.author}, o comando não funcionou parece que deu um erro! caso persista entre em meu suporte <https://penguinbot.online/suporte> \n\`${e.message}\``
    });
  }
});

function ms(ms) {
  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);
  const days = ~~(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}
