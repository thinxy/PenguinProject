import client from "../../../index.js";
import { WebhookClient } from "discord.js";

client.on("interactionCreate", async (interaction) => {
  const { commandName } = interaction;
  let cmd = client.slashCommands.get(commandName);

  let canal = client.guilds.cache
    .get(`923326838204407828`)
    .channels.cache.get(`1007066580879933470`);

  let dia = Math.round(Date.now() / 1000);

  let content = " " || "Nenhuma Option utilizada.";

  try {
    const wh = new WebhookClient({
      url: "https://canary.discord.com/api/webhooks/1008936493097701457/rbGaiJO3YJzGS9MlGPqmbS8dLMMQaet_bjzqTJKIC8fJMULunJImp-zcFRZucofr7hTB",
    });

    wh.send(
      `**🗑️ - Logs Comandos**\n**💸 - Usuário:**\n\n\`${interaction.user.tag} ( ${interaction.user.id} )\`\n\n**🍨 - Comando:**\n\n\`/${cmd.name}\`\n\n**🗂️ - Options:**\n\n\`${content}\`\n\n**📆 - Dia:**\n\n<t:${dia}:F> ( <t:${dia}:R> )\n\n**🏘️ - Servidor:**\n\n\`${interaction.guild.name} ( ${interaction.guild.id} )\``
    );
  } catch (e) {
    console.log(e);
    interaction.reply(`Estou sem a permissão de criar webhooks.`);
  }
});
