import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import Command from "../../Structures/base/Command.js";
import SQL from "sequelize";
import pkg from "util-stunks";
const { unabbreviate } = pkg;

export default class PayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: "｢Economia｣pague gelitos a um usuário.",
      aliases: ["pagar", "pix"],
      help: {
        usage: "{prefix}pay <@user> <valor>",
      },
    });
  }
  async run(message, args, prefix) {
    const user =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);
    const valor = unabbreviate(args[1]);

    if (!user) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você não mencionou nenhum usuário para apostar.`,
        ephemeral: true,
      });
    }

    if (!valor) {
      return message.reply({
        content: `${this.client.emojis.error} **-** ${message.author}, você deve colocar um valor para fazer a transferência.`,
        ephemeral: true,
      });
    }

    if (user.id == message.author.id) {
      return message.reply({
        content: `${this.client.emojis.error} **-** ${message.author}, você não pode transferir dinheiro para si mesmo, coloque um usuário válido.`,
        ephemeral: true,
      });
    }

    const userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (!userdb || userdb.dataValues.money == 0) {
      return message.reply({
        content: `${this.client.emojis.error} **-** ${message.author}, você não tem dinheiro suficiente para completar essa transação.`,
        ephemeral: true,
      });
    }

    if (userdb.dataValues.money < valor) {
      return message.reply({
        content: `${this.client.emojis.error} **-** ${message.author}, você não tem dinheiro suficiente para completar essa transação.`,
        ephemeral: true,
      });
    }

    if (valor < 1) {
      return message.reply({
        content: `${this.client.emojis.error} **-** ${message.author}, você deve colocar um valor acima de 0 para fazer a transferência.`,
        ephemeral: true,
      });
    }

    let userdb2 = await this.client.db.users.findOne({
      where: { id: user.id },
    });

    if (Date.now() > userdb.dataValues.daily) {
      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, você não resgatou o seu prêmio diário use \`${prefix}daily\` para poder usar meus comandos de economia.`,
        ephemeral: true,
      });
    }
    if (Date.now() > user2.dataValues.daily) {
      return message.reply({
        content: `${this.client.emoji.temp} **-** ${message.author}, o usuário ${userU}, não resgatou o seu prêmio diário para ele resgatar ele precisa utilizar \`${prefix}daily\` para poder usar meus comandos de economia.`,
        ephemeral: true,
      });
    }

    if (message.guild.members.me.permissions.has("AddReactions")) {
      return message.reply(
        `${this.client.emoji.error} **-** ${message.author}, Eu não tenho a permissão para enviar este comando! Para utilizá-lo, preciso ter permissão \`AddReactions\`!`
      );
    }

    if (userdb2.dataValues.verify == false) {
      message.reply({
        content: `${client.emoji.error} **-** ${message.author}, hm... me parece que o usuário ${user} ainda não é verificado na minha database.`,
      });
    }

    message
      .reply({
        content: `💸 **-** ${user}, o usuário ${
          message.author
        }, quer lhe enviar um pagamento no valor de \`${valor.toLocaleString()} Gelitos\`, para confirmar esse pagamento os 2 usuários devem reagir ao emoji "💸".\n\n**Não se esqueça:** È proibido qualquer troca que possa ter valor monetário como \`(Nitro, dinheiro real, invites, conteúdo ilegal/NSFW, etc)\` por gelitos e caso venda gelitos por dinheiro real, você será banido do Penguin permanentemente! Veja todas as regras em <https://penguinbot.online/termos>.`,
        fetchReply: true,
      })
      .then((msg) => {
        msg.react("💸");

        const filter = (reaction, usuário) => {
          return (
            reaction.emoji.name === "💸" &&
            [message.author.id, user.id].includes(usuário.id)
          );
        };

        const collector = msg.createReactionCollector({
          filter: filter,
          time: 1000 * 60 * 10,
        });

        collector.on("collect", async (reaction) => {
          const users = reaction.users.cache.map((a) => a.id);

          if (users.includes(message.author.id) && users.includes(user.id)) {
            collector.stop();

            if (userdb.dataValues.money < valor) {
              return message.channel.send({
                embeds: [
                  new Discord.MessageEmbed()
                    .setTitle(`💸 Dinero acabou...`)
                    .setColor("a5d7ff")
                    .setDescription(
                      `Infelizmente ${message.author} não tem mais essa valor de dinheiro para lhe pagar...`
                    ),
                ],
              });
            }

            let t = userdb.dataValues.tr;
            if (!t) t = [];

            let t2 = userdb2.dataValues.tr;
            if (!t2) t2 = [];

            t.unshift(
              `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                message.createdAt / 1000
              )}:t>] 📤 **|** Enviou um pagamento de **${valor.toLocaleString(
                "en-US"
              )} Gelitos** para o usuário \`${user.tag}\`.`
            );
            t2.unshift(
              `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                message.createdAt / 1000
              )}:t>] 📥 **|** Recebeu um pagamento de **${valor.toLocaleString(
                "en-US"
              )} Gelitos** do usuário \`${message.author.tag}\`.`
            );

            await this.client.db.users.update(
              {
                money: SQL.literal(`money - ${valor}`),
                tr: t,
              },
              {
                where: { id: message.author.id },
              }
            );

            await this.client.db.users.update(
              {
                money: SQL.literal(`money + ${valor}`),
                tr: t2,
              },
              {
                where: { id: user.id },
              }
            );

            msg.delete();

            message.channel.send({
              content: `💸 **-** Prontinho ${user}, você acaba de receber \`${valor.toLocaleString()} Gelitos\` do usuário ${
                message.author
              }!`,
            });
          }
        });
      });
  }
}
