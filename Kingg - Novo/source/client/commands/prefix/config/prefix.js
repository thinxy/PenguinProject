module.exports = {
  name: "prefixo",
  aliases: [
    "prefix",
    "setprefix",
    "definirprefixo",
    "alterarprefixo",
    "newprefix",
  ],
  description:
    "Verifica seu saldo atual ou o de um outro usuário em específico.",
  uso: "[novo prefixo]",
  cooldown: 1700,
  run: async (client, message, args, config, database) => {
    const { emojis: e, text: t } = config;
    const doc = await database.get(message.guild.id, "Guild"),
      newPrefix = args[0];

    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message?.reply(
        `${e.error} **${t.separator}** ${message.author}, você precisa da permissão de \`Administrador\` para usar esse comando.`
      );
    if (!newPrefix || newPrefix.length > 3)
      return message?.reply(
        `${e.error} **${t.separator}** ${message.author}, coloque um novo prefixo menor que **3** caracteres.`
      );
    if (doc?.config?.prefix?.toLowerCase() === newPrefix?.toLowerCase())
      return message?.reply(
        `${e.error} **${t.separator}** ${message.author}, coloque um novo prefixo diferente do atual.`
      );

    doc.config.prefix = newPrefix;
    doc.save();

    message?.reply({
      content: `${e.success} **${t.separator}** ${message.author}, meu prefixo foi alterado com sucesso! Novo prefixo: **${newPrefix}**`,
    });
  },
};
