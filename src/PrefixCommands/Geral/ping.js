import Command from "../../Structures/base/Command.js";

export default class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "veja minha latência e tempo de resposta.",
      aliases: ["pong"],
    });
  }
  async run(message, args) {
    const st = process.hrtime()

    await this.client.db.users.findOne({
      where: { id: message.author.id }
    });

    const sto = process.hrtime(st)
    const pingDB = Math.round((sto[0] * 1e9 + sto[1]) / 1e6);

    const msg = await message.reply(`📡 **-** Calculando ping...`).then(msg => {
      msg.edit({ content: `🏓 **-** ${message.author} **Pong!**\n**⏰ - Gateway Ping:** \`${Date.now() - message.createdTimestamp}ms\`\n**⚡ - API Ping:** \`${Math.round(this.client.ws.ping)}ms\`\n**${this.client.emoji.mongo} - DataBase Ping:** \`${pingDB}ms\`` })
    });
  }
}
