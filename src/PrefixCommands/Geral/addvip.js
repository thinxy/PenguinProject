import Command from "../../Structures/base/Command.js";
import ms from "ms";

export default class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addvip",
      description: "veja minha latência e tempo de resposta.",
      aliases: ["av"],
    });
  }
  async run(message, args) {
    const user =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);
    const date = parseInt(args[1])
    const m = ms(`${date}d`)
    const datems = parseInt(Date.now() + m)

    if (!user) {
      return message.reply(`coloca o usuário para ativar o premium.`);
    }
    if (!date) {
        return message.reply(`coloque a qauntidade de dias do premium.`)
    }

    const userdb = await this.client.db.users.findOne({
      where: { id: user.id },
    });

    const authorDB = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });


    if (authorDB.dataValues.staff == false) {
      return message.reply(`?`)
    }

    message.reply(`🎉 **-** Parabéns ${user}! você recebeu um premium de \`${date} Dias\` pelo staff ${message.author}.`);

    await this.client.db.users.update({
        vip: datems
    },
    {
        where: { id: user.id }
    })
  }
}
