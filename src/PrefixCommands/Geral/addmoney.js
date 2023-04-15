import Command from "../../Structures/base/Command.js";
import ms from "ms";
import SQL from "sequelize";

export default class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addmoney",
      description: "veja minha latência e tempo de resposta.",
      aliases: ["ad"],
    });
  }
  async run(message, args) {
    const user =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;
    const m = parseInt(args[1]);

    const userdb = await this.client.db.users.findOne({
      where: { id: user.id },
    });

    const authorDB = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });


    if (authorDB.dataValues.staff == false) {
      return message.reply(`?`)
    }

    message.reply(
      `🎉 **-** Parabéns ${user} \`(${
        user.id
      })\`! você recebeu uma alteração em saldo de Gelitos no valor de \`${m.toLocaleString()} Gelitos\`.`
    );

    let t = userdb.dataValues.tr;
    if (!t) t = [];

    t.unshift(
      `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
        message.createdAt / 1000
      )}:t>] 📥 **|** Recebeu **${m.toLocaleString(
        "en-US"
      )} Gelitos** do staff \`${message.author.tag}\`.`
    );

    await this.client.db.users.update(
      {
        money: SQL.literal(`money + ${m}`),
        tr: t
      },
      {
        where: { id: user.id },
      }
    );
  }
}
