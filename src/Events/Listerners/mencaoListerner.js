import client from "../../../index.js";

client.on("messageCreate", async (message) => {
  let guildb = await client.db.guilds.findOne({
    where: { id: message.guild.id }
  })
  let prefix = guildb.dataValues.prefixo || "p!";

  if (message.author.bot) return;
  if (!message.guild) return;

  if (
    message.content == `<@${client.user.id}>` ||
    message.content == `<@!${client.user.id}>`
  ) {
    message.reply(
      `<:penguin_mention:1027377322254418042> Olá ${message.author}, meu nome é **${client.user.tag}**, meu prefixo atual nesse servidor é \`${prefix}\`, para ver meus comandos utilize \`${prefix}help\`.`
    );
  }
});
