import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";

export default class AfkCommand extends Command {
  constructor(client) {
    super(client, {
      name: "afk",
      description:
        "｢Utilidade｣entre em afk para todos saberem que você não pode responder no momento.",
      help: {
        usage: "{prefix}afk [motivo]",
      },
    });
  }
  async run(message, args, prefix) {
    let motivo = args[0];
    if (!motivo) motivo = "Nenhum motivo foi dado para o afk do usuário.";
    if (motivo.lenght >= 250) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, o maximo de caracteres em um motivo do afk é \`250 caracteres\`.`,
        ephemeral: true,
      });
    }

    let userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });
    let BooleanAfk = userdb.dataValues.afkuser;

    message.reply(
      `${this.client.emoji.correct} **-** ${message.author}, seu afk foi ativado com sucesso! irei retira-ló assim que você enviar uma menssagem em algum servidor eu esteja.`
    );

    await this.client.db.users.update(
      {
        afkuser: true,
        motiveafk: motivo,
      },
      {
        where: { id: message.author.id },
      }
    );
  }
}
