import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";

export default class AfkSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "afk",
      description:
        "｢Utilidade｣entre em afk para todos saberem que você não pode responder no momento.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "motive",
          description:
            "coloque o motivo do seu afk.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      help: {
        usage: "/afk [motivo]",
      },
    });
  }
  async run(interaction, prefix) {
    let motivo = interaction.options.getString("motive");
    if (!motivo) motivo = "Nenhum motivo foi dado para o afk do usuário.";
    if (motivo.lenght >= 250) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, o maximo de caracteres em um motivo do afk é \`250 caracteres\`.`,
        ephemeral: true
      })
    }

    let userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id }
    })
    let BooleanAfk = userdb.dataValues.afkuser;

      interaction.editReply(`${this.client.emoji.correct} **-** ${interaction.user}, seu afk foi ativado com sucesso! irei retira-ló assim que você enviar uma menssagem em algum servidor eu esteja.`)

      await this.client.db.users.update({
        afkuser: true,
        motiveafk: motivo
      },
      {
        where: { id: interaction.user.id }
      })
  }
}
