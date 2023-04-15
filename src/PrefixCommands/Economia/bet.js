import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import Command from "../../Structures/base/Command.js";
import SQL from "sequelize";
import pkg from "util-stunks";
const { unabbreviate } = pkg;

export default class BetCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bet",
      description: "「Economia」aposte com algum usuário.",
      help: {
        usage: "{prefix}bet <user> <value>",
      },
    });
  }
  async run(message, args, prefix) {
    const userdb = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    let money = unabbreviate(args[1]);
    let taxa = (money * 93) / 100;
    let taxa1 = money - taxa;

    let userU =
      message.mentions.users.first() || this.client.users.cache.get(args[0]);

    if (!userU) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você não mencionou nenhum usuário para apostar.`,
        ephemeral: true,
      });
    } else if (userU.id === message.author.id) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você não pode apostar com você mesmo!`,
        ephemeral: true,
      });
    }

    const user2 = await this.client.db.users.findOne({
      where: { id: userU.id },
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

    if (!user2) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, o usuário mencionado não está registrado em minha database.`,
        ephemeral: true,
      });
    }

    if (!money) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, você colocou nenhum valor para a aposta!`,
        ephemeral: true,
      });
    }

    let carteira_jg1 = userdb.dataValues.money;

    let carteira_jg2 = user2.dataValues.money;

    if (isNaN(money)) {
      return message.reply({
        content: `${this.client.emoji.error} **-** ${message.author}, não consegui processar o valor \`${money}\`, na minha database, por favor utilize apenas números.`,
        ephemeral: true,
      });
    }

    if (carteira_jg1 < money) {
      return message.reply(
        `${this.client.emoji.error} **-** ${
          message.author
        }, Você não possui **${money.toLocaleString()} Gelitos** para poder apostar com \`${
          userU.tag
        }\`.`
      );
    }

    if (carteira_jg2 < money) {
      return message.reply(
        `${this.client.emoji.error} **-** ${message.author}, O usuário \`${
          userU.tag
        }\` não possui **${money.toLocaleString()} Gelitos** para poder apostar com você.`
      );
    }

    message
      .reply({
        content: `Olá ${userU}, o usuário ${
          message.author
        } quer lhe desafiar em uma aposta no valor de **${money.toLocaleString()} Gelitos**, como nenhum de vocês não são usuários premium o valor da aposta sofreu uma taxa de \`5%\`, totalizando **${taxa.toLocaleString()} Gelitos**, para você aceitar esse desafio os dois devem clicar na reação "✅"`,
        fetchReply: true,
      })
      .then(async (msg) => {
        msg.react("✅");

        const filtro = (reaction, usuário) => {
          return (
            reaction.emoji.name === "✅" &&
            [message.author.id, userU.id].includes(usuário.id)
          );
        };

        const collector = msg.createReactionCollector({
          filter: filtro,
          time: 1000 * 60 * 10,
        });

        collector.on("collect", async (reaction) => {
          const users = reaction.users.cache.map((a) => a.id);

          if (users.includes(message.author.id) && users.includes(userU.id)) {
            collector.stop();

            if (userdb.dataValues.money < taxa) {
              return message.reply(
                `Infelizmente ${message.author} não tem mais essa quantia de dinheiro para lhe pagar...`
              );
            }

            let competidores = [userU, message.author];
            let vencedor =
              competidores[Math.floor(Math.random() * competidores.length)];

            if (vencedor.id == userU.id) {
              message.reply(
                `${
                  this.client.emoji.correct
                } **-** Parabéns! ${userU}, você acaba de ganhar o desafio do usuário ${
                  message.author
                }, e levou para casa um prêmio no valor de **${taxa.toLocaleString()} Gelitos**!`
              );

              msg.reactions.removeAll().catch((e) => console.log(e));

              let t = userdb.dataValues.tr;
              if (!t) t = [];

              let t2 = user2.dataValues.tr;
              if (!t2) t2 = [];

              t.unshift(
                `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                  message.createdAt / 1000
                )}:t>] 📤 **|** Perdeu **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${userU.tag}\`.`
              );
              t2.unshift(
                `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                  message.createdAt / 1000
                )}:t>] 📥 **|** Ganhou **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${
                  message.author.tag
                }\`.`
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money - ${taxa}`),
                  tr: t,
                },
                {
                  where: { id: message.author.id },
                }
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money + ${taxa}`),
                  tr: t2,
                },
                {
                  where: { id: userU.id },
                }
              );
            } else if (vencedor.id == message.author.id) {
              message.reply(
                `${this.client.emoji.correct} **-** Parabéns! ${
                  message.author
                }, você acaba de ganhar o desafio contra o usuário ${userU}, e levou para casa um prêmio no valor de **${taxa.toLocaleString()} Gelitos**!`
              );

              msg.reactions.removeAll().catch((e) => console.log(e));

              let t = userdb.dataValues.tr;
              if (!t) t = [];

              let t2 = user2.dataValues.tr;
              if (!t2) t2 = [];

              t.unshift(
                `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                  message.createdAt / 1000
                )}:t>] 📥 **|** Ganhou **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${userU.tag}\`.`
              );
              t2.unshift(
                `[<t:${Math.ceil(message.createdAt / 1000)}:d> <t:${Math.ceil(
                  message.createdAt / 1000
                )}:t>] 📤 **|** Perdeu **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${
                  message.author.tag
                }\`.`
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money + ${taxa}`),
                  tr: t,
                },
                {
                  where: { id: message.author.id },
                }
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money - ${taxa}`),
                  tr: t2,
                },
                {
                  where: { id: userU.id },
                }
              );
            }
          }
        });
      });
  }
}
