import SlashCommand from "../../Structures/base/SlashCommand.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

export default class CooldownSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "cooldowns",
      description:
        "「Economia」veja o seu tempo para utilizar os comandos de economia ou de algum usuário.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "mencione o usuário que deseja ver o cooldown.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      help: {
        usage: "/cooldowns [@user]",
      },
    });
  }
  async run(interaction, prefix) {
    let user = interaction.options.getUser("user") || interaction.user;

    let userdb = await this.client.db.users.findOne({
      where: { id: user.id },
    });

    // Cooldowns:

    let trabalho = userdb.dataValues.work - Date.now();
    //let semanal = userdb.economia.cooldowns.sem - Date.now();
    let mendigar = userdb.dataValues.crime - Date.now();
    let reputacao = userdb.dataValues.rep - Date.now();
    //let crime = userdb.economia.cooldowns.rob - Date.now();
    //let vote = userdb.economia.cooldowns.vot - Date.now();
    let vip = userdb.dataValues.vip - Date.now();
    let vic = userdb.dataValues.vic - Date.now();
    let dailytime = userdb.dataValues.daily - Date.now();

    if (dailytime < 0) {
      dailytime = "**Disponivel! ✅**";
    } else {
      dailytime = `**Disponivel em** \`${ms(dailytime).hours}h ${
        ms(dailytime).minutes
      }m ${ms(dailytime).seconds}s\``;
    }

    if (vip < 0) {
      vip = `**Indisponível :x:**`;
    } else {
      vip = `**Seu vip expira em** \`${ms(vip).days}d ${ms(vip).hours}h ${
        ms(vip).minutes
      }m ${ms(vip).seconds}s\``;
    }

    if (vic < 0) {
      vic = "**Disponivel! ✅**";
    } else {
      vic = `**Disponivel em** \`${ms(vic).hours}h ${ms(vic).minutes}m ${
        ms(vic).seconds
      }s\``;
    }

    if (reputacao < 0) {
      reputacao = "**Disponivel! ✅**";
    } else {
      reputacao = `**Disponivel em** \`${ms(reputacao).hours}h ${
        ms(reputacao).minutes
      }m ${ms(reputacao).seconds}s\``;
    }

    if (trabalho < 0) {
      trabalho = "**Disponivel! ✅**";
    } else {
      trabalho = `**Disponivel em** \`${ms(trabalho).hours}h ${
        ms(trabalho).minutes
      }m ${ms(trabalho).seconds}s\``;
    }
    /*
    if (semanal < 0) {
      semanal = "**Disponivel! ✅**";
    } else {
      semanal = `**Disponivel em** \`${ms(semanal).days}d ${
        ms(semanal).hours
      }h ${ms(semanal).minutes}m ${ms(semanal).seconds}s\``;
    }*/

    if (mendigar < 0) {
      mendigar = "**Disponivel! ✅**";
    } else {
      mendigar = `**Disponivel em** \`${ms(mendigar).hours}h ${
        ms(mendigar).minutes
      }m ${ms(mendigar).seconds}s\``;
    }
    /*
    if (crime < 0) {
      crime = "**Disponível! ✅**";
    } else {
      crime = `**Disponível em** \`${ms(crime).hours}h ${ms(crime).minutes}m ${
        ms(crime).seconds
      }s\``;
    }

    if (vote < 0) {
      vote = "**Disponível! ✅**";
    } else {
      vote = `**Disponível em** \`${ms(vote).hours}h ${ms(vote).minutes}m ${
        ms(vote).seconds
      }s\``;
    }*/

    if (interaction.user.id == interaction.user.id) {
      let embed = new EmbedBuilder()
        .setTitle("⏰​ **-** Tempo de Esperas")
        .setDescription(
          `*${interaction.user}, aqui esta a sua lista de espera de comandos, junto com eles irá aparecer (✅​) quando estiver pronto e (❌​) quando estiver indisponível.*`
        )
        .setTimestamp()
        .setColor(this.client.config.color)
        .addFields({
          name: "⏰​ Cooldowns:",
          value: `**💸 Economia:**\n\n> \`Daily:\` ${dailytime}\n> \`Crime:\` ${mendigar}\n> \`Trabalhar:\` ${trabalho}\n> \`Vip-Claim:\` ${vic}\n\n**👍 Outros:**\n\n> \`Curtida:\` ${reputacao}\n> \`Vip:\` ${vip}`,
        });

      let button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()

          .setCustomId("1")
          .setLabel(`Cooldowns de ${user.tag}`)
          .setDisabled(true)
          .setStyle(ButtonStyle.Success)
      );

      interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [button],
      });
    } else {
      let embed = new EmbedBuilder()
        .setTitle("⏰​ **-** Tempo de Esperas")
        .setThumbnail(
          "https://media.discordapp.net/attachments/931754521842053150/1016814373412552734/relogio.gif?width=325&height=325"
        )
        .setDescription(
          `*${interaction.user}, aqui esta a sua lista de espera de comandos, junto com eles irá aparecer (☑️​) quando estiver pronto e (❌​) quando estiver indisponível.*`
        )
        .setTimestamp()
        .setColor(this.client.config.color)
        .addFields({
          name: "⏰​ Cooldowns:",
          value: `**💸 Economia:**\n\n> \`Daily:\` ${dailytime}\n> \`Crime:\` ${mendigar}\n> \`Trabalhar:\` ${trabalho}\n> \`Vip-Claim:\` ${vic}\n\n**👍 Outros:**\n\n> \`Curtida:\` ${reputacao}`,
        });

      let button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()

          .setCustomId("1")
          .setLabel(`Cooldowns de ${user.tag}`)
          .setDisabled(true)
          .setStyle(ButtonStyle.Success)
      );

      interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [button],
        ephemeral: true,
      });
    }
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
