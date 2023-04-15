import client from "../../../index.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import moment from "moment";

client.on("guildMemberAdd", async (member) => {
  try {
    let guild1 = member.guild;
    const guild = await client.guilds.cache.get(guild1);

    const server = await client.db.guild.findOne({
      guildID: guild1.id,
    });

    const canal = client.channels.cache.get(server.welcome.channel);

    const msg = server.welcome.msg
      .replace("{member}", `<@${member.id}>`)
      .replace("{user}", `${member.user.username}`)
      .replace("{users}", guild1.memberCount)
      .replace("{guild}", guild1.name);

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("msg")
        .setLabel(`Sent from server: ${guild1.name}`)
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    if (server.welcome.status) {
      canal.send({ content: `${msg}`, components: [button] });
    }

    if (server.autorole.status) {
      member.roles.add(server.autorole.roles, "Sistema de autorole");
    }
  } catch (err) {
    if (err) console.log(err);
  }
});
