import client from "../../../index.js";

client.on("messageCreate", async (message) => {
  if (message.bot) return;

  let user = message.author;
  let userdb = await client.db.users.findOne({
    where: { id: user.id },
  });
  if (!userdb) return;

  if (userdb.dataValues.afkuser == true) {
    await client.db.users.update(
      {
        afkuser: false,
        maotiveafk: "Nada.",
      },
      {
        where: { id: message.author.id },
      }
    );

    return message.reply(
      `Olá ${message.author}, que bom que voltou! já desativei seu afk pode ficar despreocupado.`
    );
  } else if (userdb.dataValues.afkuser == false) {
    return;
  }

  let usermention = message.mentions.users.first();

  if (usermention) {
    let mentiondb = await client.db.users.findOne({
      where: { id: usermention.id },
    });
    if (mentiondb.dataValues.afkuser == true) {
      return message.reply(
        `Olá ${message.author}, o usuário ${usermention}, está afk no momento com o motivo: \`${mentiondb.dataValues.motiveafk}\`!`
      );
    } else {
      return;
    }
  }
});
