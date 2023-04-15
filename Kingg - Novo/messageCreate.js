const client = require("../../index");
const emoji = require('../../Utils/emojis.json');
const Guild = require('../../Database/Schemas/guild.js');

client.on("guildCreate", async guild => {
  let gCreate = await Guild.findOne({
    guildID: guild.id
  })
  if (!gCreate) {
    const newGuild = new Guild({
      guildID: guild.id,
      prefixo: "p!"
    })
    await newGuild.save();
  }
});

client.on("messageCreate", async (message) => {
  let guildb = await client.guildb.findOne({
    guildID: message.guild.id
  })

  const prefix = guildb.prefixo || "p!"

  if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const [comando, ...args] = message.content.slice(prefix.length).trim().split(/ +/)

  const cmd = client.prefixCommands.get(comando)

  if (!cmd) return message.reply(`${emoji.erro1} **-** ${message.author}, Não achei nenhum comando relacionado a \`${comando}\` em minha memória interna.`)

  /*
  if (message.author.id !== "933949150687543437") {
    const button = new Discord.MessageActionRow()

      .addComponents(
        new Discord.MessageButton()
        .setStyle('LINK')
        .setEmoji('💸')
        .setLabel('Meu Suporte')
        .setURL('https://discord.gg/UaMetVcYsv')
      )

    return message.reply({ content: `🚧 **-** Olá ${message.author}, você não pode me utilizar neste momento, pois estou em manutenção, entre no meu servidor suporte para mais informações.`, components: [button] })
  }
  */

  let userdb = await client.userdb.findOne({
    userID: message.author.id
  })

  if (!userdb) userdb = await new client.userdb({ userID: message.author.id }).save();

  let userdb2 = await client.userdb.findOne({
    userID: client.user.id
  })

  if (!userdb2) userdb2 = await new client.userdb({ userID: client.user.id }).save();

  let banidos = await client.userdb.findOne({
    userID: message.author.id
  }) || { economia: { blacklist: { baned: true } } }

  let mot = userdb.economia.blacklist.motive

  let day = userdb.economia.blacklist.dateBan

  const { banido } = banidos.economia.blacklist;

  if (banido) return message.reply({ content: `👮 **-** Mãos para o alto! ${message.author}, você está banido de utilizar meus comandos!\n> 📝 **-** Motivo: \`${mot}\`\n> ⏱️ **-** Dia: <t:${day}:F>`, ephemeral: true })

  if (userdb.bot.verificado == false) {
    message.reply({ content: `${emoji.erro1} **-** ${message.author}, hm... me parece que você ainda não é verificado na minha database.` }).then(msg => {

      msg.edit({ content: `<a:load:993255438730661918> **-** Configurando seu perfil...` })

      setTimeout(async () => {
        msg.edit({ content: `${emoji.correto1} **-** Prontinho! ${message.author}, você foi registrado com sucesso na minha database, por favor utilize o comando novamente.` })

        await client.userdb.updateOne({
          userID: message.author.id
        }, {
          $set: {
            "bot.verificado": true
          }
        })
      }, 7000)
      return;
    })
    return;
  }

  await client.userdb.updateOne(
  {
    userID: message.author.id
  },
  {
    $set: {
      "economia.cooldowns.cmd": Date.now() + 3000,
      "bot.commandsUser": userdb.bot.commandsUser + 1
    }
  });

  await client.userdb.updateOne({
    userID: client.user.id
  }, {
    $set: {
      "bot.commandsUsed": userdb2.bot.commandsUsed + 1
    }
  })

  if (Date.now() < userdb.economia.cooldowns.cmd) {
    const calc = userdb.economia.cooldowns.cmd - Date.now()
    return message.reply(`${emoji.tempo} **-** ${message.author}, você está usando comandos muito rápidos espere \`${ms(calc).seconds} Segundos\`.`)
  }

  try {
    cmd.run(client, message, args, prefix)
  } catch (err) {

    console.error('Erro:' + err);
  }
});

function ms(ms) {
  const seconds = ~~(ms / 1000)
  const minutes = ~~(seconds / 60)
  const hours = ~~(minutes / 60)
  const days = ~~(hours / 24)

  return { days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 }
}
