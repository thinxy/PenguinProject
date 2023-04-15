import Command from "../../Structures/base/Command.js";

export default class SetPrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "「Mod」mude meu prefixo em seu servidor.",
      aliases: [
        "prefix",
        "set-prefix",
        "definirprefixo",
        "alterarprefixo",
        "newprefix",
      ],
      help: {
        usage: "{prefix}setprefix <novo preixo>",
      },
    });
  }
  async run(message, args) {
    let newPrefix = args[0];

    let guildb = await this.client.db.guilds.findOne({
      where: { id: message.guild.id },
    });

    let prefixAntigo = guildb.dataValues.prefixo

    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message?.reply(
        `${this.client.emoji.error} **-** ${message.author}, você precisa da permissão de \`Administrador\` para usar esse comando.`
      );
    if (!newPrefix || newPrefix.length > 3)
      return message?.reply(
        `${this.client.emoji.error} **-** ${message.author}, coloque um novo prefixo menor que **3** caracteres.`
      );
    if (prefixAntigo.toLowerCase() === newPrefix?.toLowerCase())
      return message?.reply(
        `${this.client.emoji.error} **-** ${message.author}, coloque um novo prefixo diferente do atual.`
      );

    await this.client.db.guilds.update(
      {
        prefixo: newPrefix,
      },
      {
        where: { id: message.guild.id },
      }
    );
    message?.reply({
      content: `${this.client.emoji.correct} **-** ${message.author}, meu prefixo foi alterado com sucesso! Novo prefixo: **${newPrefix}**`,
    });
  }
}
