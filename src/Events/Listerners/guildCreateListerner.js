import client from "../../../index.js";
import {
  WebhookClient,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ChannelType,
  AuditLogEvent,
} from "discord.js";
import moment from "moment";
moment.locale("pt-BR");

client.on("guildCreate", async (guild) => {
  let donoId = guild.ownerId;
  let dono = await client.users.fetch(`${donoId}`);

  let embed = new EmbedBuilder()
    .setColor(client.config.color)
    .setTitle(`**🍨 **-** Fui adicionado!**`)
    .setDescription(
      `Agora estou em ${client.guilds.cache.size} servidores, com ${client.users.cache.size} usuário, contendo ${client.slashCommands.size} comandos.`
    )
    .addFields(
      {
        name: "**🏘️ **-** Informacao do servidor:**",
        value: `**📌 Nome:**\n> \`${guild.name}\`\n**🗂️ ID:**\n> \`${
          guild.id
        }\`\n**👥 Membros:**\n> \`${
          guild.memberCount
        }\`\n**📆 Data de criação:**\n> \`${moment(guild.createdAt).format(
          "LLL"
        )}\``,
        inline: true,
      },
      {
        name: "**👑 Dono do servidor:**",
        value: `**📌 Nome:**\n> ${dono.tag}\n**🗂️ ID:**\n> \`${guild.ownerId}\``,
        inline: true,
      },
      {
        name: "💭 Canais:",
        value: `**+** Total:\n> \`${
          guild.channels.cache.size
        }\`\n**+** De texto:\n> \`${
          guild.channels.cache.filter((x) => x.type == ChannelType.GuildText)
            .size
        }\`\n**+** De voz:\n> \`${
          guild.channels.cache.filter((x) => x.type == ChannelType.GuildVoice)
            .size
        }\``,
        inline: true,
      }
    )
    .setTimestamp();
  try {
    const wh = new WebhookClient({
      url: "https://canary.discord.com/api/webhooks/1011806961588785263/6cCjUoyfh6S-ztf9Is6yWNWLK5OgkQwMUOSi6GNpt07Bxjj99Tk2x-Fi1hgQ1zBxuQ_1",
    });

    //https://discord.com/api/webhooks/996196769719406643/SBVTW0qKOFUstmXhS4w7sjhF4u7YfScF83-GnQRP1mYsb7mU0B2KD1kFn2hIA8-MEVn4
    wh.send({ embeds: [embed] });
  } catch (e) {
    console.log(e);
  }
});

client.on("guildCreate", async (guild) => {
  try {
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.BotAdd,
    });
    const addAuthorLog = fetchedLogs.entries.first();
    const { executor, target } = addAuthorLog;

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("💸")
        .setLabel("Me Adicione")
        .setURL(
          "https://discord.com/oauth2/authorize?client_id=976649493950898277&permissions=134597824&scope=bot%20applications.commands"
        ),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("🍨")
        .setLabel("Suporte")
        .setURL("https://discord.gg/kyt6GpZkdc"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("📌")
        .setLabel("Website")
        .setURL("https://penguinbot.online/"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("🗳️")
        .setLabel("Vote")
        .setURL("https://top.gg/bot/976649493950898277")
    );

    executor.send({
      content: `**🎉 Penguin Bot!**

      • Olá <@${executor.id}>, não sei se foi você que me adicionou no servidor **${guild.name}** mas já que você é o Dono/Staff do servidor, resolvi te enviar está mensagem.

> **🤔 O posso fazer?**

     • Eu estou contando atualmente com **${client.slashCommands.size} comandos**, separados por 4 categorias, com isso contando com um sistema de **economia, moderação, diversão, utilidades e muitos mais...** com muitas variedades de comandos!
     
     • Com meus sistema de moderação, você pode ficar tranquilo com qualquer punição que você pretende dar, assim podendo relaxar e conseguindo descansar de alguns afazeres no seu servidor.

> **🤔 Como me utilizar?**

    • Bom, tenho **apenas uma formas** de ser usado.
     
     ・Você pode me utilizar usando Slash Commands \`( / )\`.
    
> **🤔 Estou precisando de ajuda, o que eu faço?**

     • Basta ir ao meu servidor de suporte: <https://penguinbot.online/suporte>
     
     • Acesse meu site para ficar por dentro de tudo: <https://penguinbot.online/>
     
     • Lá você pode ficar sempre informado de atualizações, manutenções além de poder participar de sorteios, drops e conhecer várias pessoas que também me utilizam!
`,
      components: [button],
    });
  } catch (err) {
    console.log(`Não tenho permissão necessário.`);
  }
});

client.on("guildCreate", async (guild) => {
  await client.db.guilds.findOrCreate({
    where: { id: guild.id },
  });
});
