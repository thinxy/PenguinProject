import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

export default class RifaSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "rifa",
      description: "「Economia」veja as informações da PanguinLand Rifa.",
      type: ApplicationCommandType.ChatInput,
      help: {
        usage: "/rifa",
      },
    });
  }
  async run(interaction, prefix) {
    const user = await this.client.db.ruffle.findOne({
      where: { id: this.client.user.id },
    });
    const userC = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    const rifTime = user.dataValues.rifatime - Date.now();
    const rifaTime = `${ms(rifTime).hours} horas ${
      ms(rifTime).minutes
    } minutos ${ms(rifTime).seconds} segundos`;

    interaction.editReply(
      `${
        interaction.user
      }\n🎫 **-** PenguinLand Rifa\n💵 **-** Premiação: \`${user.dataValues.rifavalue.toLocaleString()}\`\n🎟️ **-** Tickets Comprados: \`${user.dataValues.rifabilhete}\`\n👥 **-** Participantes: \`${
        user.dataValues.rifausers.length
      }\`\n💸 **-** Último Ganhador: \`${user.dataValues.rifaganhador}\`\n⏲️ **-** Resultado irá sair em \`${rifaTime}\`\n\n> ❓ **-** Quer participar também use o comando \`${prefix}buy rifa [quantidade]\`, cada bilhete custa **250 Gelitos**.`
    );
  }
}

function ms(ms) {
  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);
  const days = ~~(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}
