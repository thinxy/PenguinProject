import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default class HelpSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "help",
      description:
        "｢Utilidade｣ veja a minha lista de comandos ou veja um em específico.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "command",
          description:
            "coloque o nome do comando que deseja obter informações.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      help: {
        usage: "/help [command]",
      },
    });
  }
  async run(interaction, prefix) {
    const c = interaction.options.getString("command");

    if (c) {
      const name = c.toLowerCase();
      const comando = this.client.slashCommands.get(name);

      if (!comando) {
        return interaction.editReply(
          `${this.client.emoji.error} **-**${interaction.user}, não achei nenhum comando com o nome **\`${name}\`**.`
        );
      }

      const AJUDA = new EmbedBuilder()
        .setTitle(`📚 Informações do comando: \`${comando.name}\`!`)
        .setFooter({
          text: `Comando utilizado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
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
            value: `\`${comando.help.usage}\``,
          }
        )
        .setColor(`${this.client.config.color}`);

      interaction.editReply({
        content: `${interaction.user}`,
        embeds: [AJUDA],
      });
    } else {
      const embed = new EmbedBuilder()
        .setTitle("❓- Penguin Help")
        .setColor("Aqua")
        .setDescription(
          `Olá ${interaction.user}, meu nome é ${this.client.username} eu sou um bot feito em JavaScript e Discord.js, caso queira ver mais informações sobremim utilize \`/botinfo\`, sou um bot focado em Economia e Administração para seu servidor.`
        )
        .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: "©️ Penguin Bot - 2023",
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
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

      interaction.followUp({ content: `${interaction.user}`, embeds: [embed], components: [row] });
    }
  }
}
