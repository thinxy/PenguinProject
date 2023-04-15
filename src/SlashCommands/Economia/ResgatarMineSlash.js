const codigos = {
  ABCD: 0.1,
  EFGH: 0.2,
  IJKL: 0.3,
  MNOP: 0.4,
  QRST: 0.5,
};

import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class ResgatarSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "resgatar",
      description: "｢economia｣resgate o código que você minerou.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "código",
          description: "coloque o código que você conseguiu minerar.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      help: {
        usage: "/resgatar <código>",
      },
    });
  }
  async run(interaction) {
    const codigo = interaction.options.getString("código").toUpperCase();
    const clientdb = await this.client.db.users.findOne({
      where: { id: this.client.user.id },
    });
    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    let codigosResgatados = clientdb.dataValues.CodigosArray;
    if (!codigosResgatados) codigosResgatados = [];

    if (codigosResgatados.includes(codigo)) {
      await interaction.followUp(
        `${this.client.emoji.error} **-** ${interaction.user}, O código \`${codigo}\` já foi resgatado ou expirou.`
      );
    } else if (codigo in codigos) {
      codigosResgatados.push(codigo);
      const bitcoin = codigos[codigo];
      delete codigos[codigo];

      const embed = new EmbedBuilder()
        .setColor(this.client.config.color)
        .setTitle("✅ **-** Resgate de código")
        .setDescription(
          `${this.client.emoji.correct} **-** ${
            interaction.user
          }, Parabéns você resgatou com sucesso o código \`${codigo}\` e recebeu \`${bitcoin.toFixed(
            2
          )} Bitcoin\` fictício.\n\n> OBS: Caso você junte \`1 Bitcoins\`, você pode trocar por Gelitos! mas tome cuidado ele pode estar lá em cima ou lá em baixo também.`
        )
        .setFooter({
          text: "©️ Desenvolvido por Purplerain#0132 - 2023",
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
      });

      await this.client.db.users.update(
        {
          bitcoins: SQL.literal(`bitcoins + ${bitcoin}`),
        },
        {
          where: { id: interaction.user.id },
        }
      );

      let code = clientdb.dataValues.CodigosArray;
      if (!code) code = [];

      code.push(codigo);

      await this.client.db.users.update(
        {
          CodigosArray: code,
        },
        {
          where: { id: this.client.user.id },
        }
      );

      const novoCodigo = gerarCodigoAleatorio();
      codigos[novoCodigo] = Math.random() * 10;
    } else {
      await interaction.editReply(`❌ O código \`${codigo}\` não é válido.`);
    }
  }
}

function gerarCodigoAleatorio() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const codigo = [];
  for (let i = 0; i < 4; i++) {
    codigo.push(letras[Math.floor(Math.random() * letras.length)]);
  }
  return codigo.join("");
}
