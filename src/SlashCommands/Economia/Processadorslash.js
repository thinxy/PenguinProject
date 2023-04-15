import { EmbedBuilder } from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";

export default class ProcessadorSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "processador",
      description: "｢economia｣veja seu processador de mineração.",
      help: {
        usage: "/processador",
      },
    });
  }
  async run(interaction) {
    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
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
        text: `Comando utilizado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

      interaction.editReply({ content: `${interaction.user}`, embeds: [embed] })
  }
}
