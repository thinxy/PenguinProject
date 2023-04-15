import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import Command from "../../Structures/base/Command.js";

export default class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "｢Utilidade｣veja o avatar de algum usuário ou o seu avatar.",
      help: {
        usage: "{prefix}avatar [@user]",
      },
    });
  }
  async run(message, args, prefix) {
    let userAvatar =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;
    let Avatarinfo = userAvatar.displayAvatarURL({
      size: 4096,
      dynamic: true,
      format: "png",
    });

    let ryan = new EmbedBuilder()
      .setColor(this.client.config.color)
      .setTitle(`Avatar de ${userAvatar.username}`)
      .setImage(Avatarinfo)
      .setFooter({
        text: `comando utilizado por: ${message.author.tag}`,
        iconURL: this.client.user.displayAvatarURL(),
      });

    let download = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download do avatar")
        .setStyle(ButtonStyle.Link)
        .setURL(Avatarinfo)
        .setEmoji("📩")
    );

    message.reply({
      content: `${message.author}`,
      embeds: [ryan],
      components: [download],
    });
  }
}
