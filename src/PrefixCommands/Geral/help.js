import Command from "../../Structures/base/Command.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description:
        "｢Utilidade｣ veja a minha lista de comandos ou veja um em específico.",
      aliases: ['ajuda','comandos'],
      help: {
        usage: "{prefix}help [command]",
      },
    });
  }
  async run(message, args, prefix) {
    const c = args[0];

    if (c) {
      const name = c.toLowerCase();
      const comando = this.client.slashCommands.get(name);

      if (!comando) {
        return message.reply(
          `${this.client.emoji.error} **-**${message.author}, não achei nenhum comando com o nome **\`${name}\`**.`
        );
      }

      const AJUDA = new EmbedBuilder()
        .setTitle(`📚 Informações do comando: \`${comando.name}\`!`)
        .setFooter({
          text: `Comando utilizado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }))
        .setDescription(
          `Aqui está uma lista de informações do comando \`${comando.name}\`.\n\n **Parâmetros:**\n> **<>** - parâmetro **Obrigatório**\n> **[]** - parâmetro **Opcional**`
        )
        .addFields(
          {
            name: `:pencil: Comando:`,
            value: `\`${comando.name}\``,
          },
          {
            name: "Descrição:",
            value: `\`${
              !comando.description.length
                ? "Não tem descrição."
                : comando.description
            }\``,
          },
          {
            name: "Modo de Uso:",
            value: `\`${comando.help.usage}\``.replace('{prefix}', prefix),
          },
          {
            name: "Aliases:",
            value: `\`${comando.aliases}\``
          }
        )
        .setColor(`${this.client.config.color}`);

      message.reply({
        content: `${message.author}`,
        embeds: [AJUDA],
      });
    } else {
      const embed = new EmbedBuilder()
        .setTitle("❓- Penguin Help")
        .setColor("Aqua")
        .setDescription(
          `Olá ${message.author}, meu nome é ${this.client.username} eu sou um bot feito em JavaScript e Discord.js, caso queira ver mais informações sobremim utilize \`/botinfo\`, sou um bot focado em Economia e Administração para seu servidor.`
        )
        .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "©️ Penguin Bot - 2023",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          {
            name: "**📖 - Lista de comandos:**",
            value: "https://penguinbot.online/comandos",
          },
          {
            name: "**📓 - Regras/Termos:**",
            value: "https://penguinbot.online/termos",
          },
          {
            name: "**🍨 - Servidor Oficial/Suporte:**",

            value: "https://penguinbot.online/suporte",
          },
          {
            name: "**🛒 - Lojinha oficial do Penguin:**",
            value: "https://penguinbot.online/loja",
          }
        )
        .addFields({
          name: "ㅤ",
          value:
            "*Caso queira informação de um comando em específico utilize `/help <comando>`!*",
        });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setEmoji("📖")
          .setLabel("Comandos")
          .setURL("https://penguinbot.online/comandos"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setEmoji("📓")
          .setLabel("Regras/Termos")
          .setURL("https://penguinbot.online/termos"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setEmoji("🍨")
          .setLabel("Suporte")
          .setURL("https://penguinbot.online/suporte")
      );

      message.reply({
        content: `${message.author}`,
        embeds: [embed],
        components: [row],
      });
    }
  }
}
