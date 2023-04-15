import SlashCommand from "../../Structures/base/SlashCommand.js"

export default class PingSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "｢Utilidade｣ veja a latência atual do penguin.",
      help: {
        usage: "/ping"
      }
    })
  }
  async run(interaction) {
    const st = process.hrtime()

    await this.client.db.users.findOne({
      where: { id: interaction.user.id }
    });

    const sto = process.hrtime(st)
    const pingDB = Math.round((sto[0] * 1e9 + sto[1]) / 1e6);
    const data = parseInt(Date.now())

    const msg = await interaction.editReply(`📡 **-** Calculando ping...`).then(msg => {
      interaction.editReply({ content: `🏓 **-** ${interaction.user} **Pong!**\n**⏰ - Gateway Ping:** \`${data - interaction.createdTimestamp}ms\`\n**⚡ - API Ping:** \`${Math.round(this.client.ws.ping)}ms\`\n**${this.client.emoji.mongo} - DataBase Ping:** \`${pingDB}ms\`` })
    });
  }
}
