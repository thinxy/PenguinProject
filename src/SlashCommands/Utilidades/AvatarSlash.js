import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";

export default class AvatarSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "｢Utilidade｣veja o avatar de algum usuário ou o seu avatar.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "mencione o usuário que você deseja ver o avatar.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      help: {
        usage: "/avatar [@user]",
      },
    });
  }
  async run(interaction) {
    let userAvatar = interaction.options.getUser("user") || interaction.user;
    let Avatarinfo = userAvatar.displayAvatarURL({
      size: 4096,
      dynamic: true,
      format: "png",
    });

    let ryan = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setTitle(`Avatar de ${userAvatar.username}`)
      .setImage(Avatarinfo)
      .setFooter({ text: `comando utilizado por: ${interaction.user.tag}`, iconURL: this.client.user.displayAvatarURL() });

    let download = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download do avatar")
        .setStyle(ButtonStyle.Link)
        .setURL(Avatarinfo)
        .setEmoji("📩")
    );

    interaction.editReply({ content: `${interaction.user}`, embeds: [ryan], components: [download] });
  }
}
