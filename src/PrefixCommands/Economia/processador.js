import { EmbedBuilder } from "discord.js";
import Command from "../../Structures/base/Command.js";

export default class ProcessadorCommand extends Command {
  constructor(client) {
    super(client, {
      name: "processador",
      description: "｢economia｣veja seu processador de mineração.",
      help: {
        usage: "{prefix}processador",
      },
    });
  }
  async run(message, args, prefix) {
    const userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    let usos = userdb.dataValues.mines;
    let processador = userdb.dataValues.proName;

    const calc = parseInt(userdb.dataValues.processador) - Date.now();

    const data = ~~((Date.now() + calc) / 1000);

    let embed = new EmbedBuilder()
      .setTitle("Painel de informação:")
      .setDescription(
        `**Processador:** \`${processador}\`\n\n**Usos Restantes:** \`${usos}\`\n\n**Cooldown:** <t:${data}> (<t:${data}:R>)`
      )
      .setColor(this.client.config.color)
      .setTimestamp()
      .setFooter({
        text: `Comando utilizado por ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    message.reply({ content: `${message.author}`, embeds: [embed] });
  }
}
