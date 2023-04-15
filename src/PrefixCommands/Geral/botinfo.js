import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ApplicationCommandType,
} from "discord.js";
import Discord from "discord.js";

import ms from "ms";
import cpuStat from "cpu-stat";
import os from "os";
import moment from "moment";
import "moment-duration-format";

export default class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botinfo",
      description: "｢Utilidades｣ veja algumas informações sobre mim.",
      aliases: ['bt'],
      help: {
        usage: "{prefix}botinfo",
      },
    });
  }
  async run(message, args) {
    const users = this.client.guilds.cache
      .map((g) => g.memberCount)
      .reduce((acc, cur) => (acc = acc + cur), 0);
    const dev = await this.client.users.fetch("1013984561153200209");

    let commandsClient = await this.client.db.users
      .findOne({ where: { id: this.client.user.id } })
      .then((data) => data.dataValues.command);

    let commandsUser = await this.client.db.users
      .findOne({ where: { id: message.author.id } })
      .then((data) => data.dataValues.command);

    const cpu = (process.cpuUsage().user / 1024 / 1024).toFixed(2);
    const uptime = moment
      .duration(message.client.uptime)
      .format("D[d] H[h] m[m] s[s]");

    const embed = new EmbedBuilder()
      .setTitle("<:penguin_botinfo:1027377400889225287> Minhas Informações")
      .setDescription(
        `Olá ${message.author}, meu nome é Penguin Bot, eu sou um simples bot de economia para o Discord, meu criador \`${dev.tag}\` está tentando me melhorar cada vez mais, eu fui desenvolvido em ${this.client.emoji.js} [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) utilizando a biblioteca ${this.client.emoji.djs} [Discord.js](https://discordjs.guide/), atualmente estou utilizando ${this.client.emoji.mongo} [ElephantSQL](https://www.elephantsql.com/) como minha Database.\n\nVocê pode me encontrar em **${this.client.guilds.cache.size} Servidores,** com **${users} Usuários** eu estou online faz **${uptime}**. Irei deixar algumas informações um pouco abaixo caso queria saber!`
      )
      .addFields(
        {
          name: "💾 Memória:",
          value: `${this.client.emoji.cpu} CPU: \`${cpu}%\`\n${
            this.client.emoji.ram
          } RAM: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )}MB\`\n${this.client.emoji.djs} Versão Discord.js: \`^${
            Discord.version
          }\`\n${this.client.emoji.node} Versão Node: \`${process.version}\``,
          inline: true,
        },
        {
          name: "🔎 Curiosiedades Extra:",
          value: `**Comandos Usados:**\n> 🧾 Total: \`${commandsClient} Comandos\`\n> 🎉 Por você: \`${commandsUser} Comandos\``,
        },
        {
          name: "🤝 Contribuidores:",
          value: `🧾 Total: **7**\n> 👑 Contribuidor: \`${dev.tag}\` **-** Criador\n> 💻 Contribuidor: \`Yuri.#8190\`\n> 💻 Contribuidor: \`Next lindo#3142\`\n> 💻 Contribuidor: \`nqlz#3721\`\n> 💻 Contribuidor: \`LEANDROTN#0101\`\n> 💻 Contribuidor: \`Purplerain#0132\`\n> 💻 Contribuidor: \`Jardineiro#0001\``,
        }
      )
      .setColor(this.client.config.color)
      .setFooter({
        text: `Comando utilizado por ${message.author.tag}.`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp()
      .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Criado por ${dev.tag}`)
        .setStyle(ButtonStyle.Primary)
        .setCustomId("3")
        .setDisabled(true)
        .setEmoji("🐧"),
      new ButtonBuilder()
        .setLabel("Entre no meu Servidor")
        .setStyle(ButtonStyle.Link)
        .setURL("https://penguinbot.online/suporte")
        .setEmoji("<:penguin_guild:1027380478652723220>"),
      new ButtonBuilder()
        .setLabel("Me adicione")
        .setStyle(ButtonStyle.Link)
        .setURL(
          "https://discord.com/api/oauth2/authorize?client_id=976649493950898277&permissions=537258176&scope=bot%20applications.commands"
        )
        .setEmoji("<:adicione:1027387664627941458>")
    );

    message.reply({
      content: `${message.author}`,
      embeds: [embed],
      components: [row],
    });
  }
}
