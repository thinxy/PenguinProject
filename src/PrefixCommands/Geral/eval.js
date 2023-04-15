import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import Discord from "discord.js";
import Command from "../../Structures/base/Command.js";
import { inspect } from "util";
import util from "util"
import ms from "ms";

export default class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      aliases: ["e", "ev"],
      description: "Execute códigos JavaScript",
      owner: true,
    });
  }

  async run(message, args) {
    if (
      message.author.id != 1013984561153200209 &&
      message.author.id != 841392424617377815
    ) {
      return;
    }

    if (!args[0]) return message.reply("?");
    if (
      message.content.includes("this.client.config.token") &&
      message.author.id != "1013984561153200209"
    )
      return message.react("🧩");
    if (
      message.content.includes("this.client.token") &&
      message.author.id != "1013984561153200209"
    )
      return message?.react("🧩");

    let code = args.join(" ");

    let time = Date.now(),
      prom = "";
    try {
      let result = await eval(code);
      if (typeof result !== "string") result = util.inspect(result);

      let response;
      if (result.length > 3980)
        response = `\`\`\`js\n${result.slice(0, 3980)} ...\n\`\`\``;
      else response = `\`\`\`js\n${result}\n\`\`\``;

      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setEmoji("🗑️")
          .setCustomId("a")
          .setStyle(ButtonStyle.Danger)
      );

      message
        .reply({
          content: `${response.replace(this.client.token, "?")}`,
          components: [btn],
        })
        .then((msg) => {
          const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id;
          };
          const collector = message.channel.createMessageComponentCollector({
            filter,
            time: ms("5m"),
            max: 1,
          });

          collector.on("collect", async (x) => {
            if (x.user.id !== message.author.id) return;

            msg.delete();
          });
        });
    } catch (e) {
      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setEmoji("🗑️")
          .setCustomId("a")
          .setStyle(ButtonStyle.Danger)
      );

      message
        .reply({ content: "```js\n" + e + "\n```", components: [btn] })
        .then((msg) => {
          const filter = (interaction) => {
            return interaction.isButton() && interaction.message.id === msg.id;
          };
          const collector = message.channel.createMessageComponentCollector({
            filter,
            time: ms("5m"),
            max: 1,
          });

          collector.on("collect", async (x) => {
            if (x.user.id !== message.author.id) return;

            msg.delete();
          });
        });
    }
  }
}
