import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class BetSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "coinflip",
      description: "「Economia」",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "bet",
          description:
            "「Economia」aposte com seus amigos e veja quem ganha mais Gelitos.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "coloque o usuário que você deseja desafiar!",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "value",
              description:
                "coloque o valor de Gelitos que você deseja apostar!",
              type: ApplicationCommandOptionType.Number,
              required: true,
            },
          ],
        },
      ],
      help: {
        usage: "/coinflip bet <user> <value>",
      },
    });
  }
  async run(interaction, prefix) {
    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    let money = interaction.options.getNumber("value");
    let taxa = (money * 93) / 100;
    let taxa1 = money - taxa;

    let userU = interaction.options.getUser("user");
    let user = this.client.users.cache.get(userU);

    const user2 = await this.client.db.users.findOne({
      where: { id: userU.id },
    });
    if (!user2) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, o usuário mencionado não está registrado em minha database.`,
        ephemeral: true,
      });
    }

    if (!userU) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, você não mencionou nenhum usuário para apostar.`,
        ephemeral: true,
      });
    } else if (userU.id === interaction.user.id) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, você não pode apostar com você mesmo!`,
        ephemeral: true,
      });
    }

    if (!money) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, você colocou nenhum valor para a aposta!`,
        ephemeral: true,
      });
    }

    let carteira_jg1 = userdb.dataValues.money;

    let carteira_jg2 = user2.dataValues.money;

    if (isNaN(money)) {
      return interaction.editReply({
        content: `${this.client.emoji.error} **-** ${interaction.user}, não consegui processar o valor \`${money}\`, na minha database, por favor utilize apenas números.`,
        ephemeral: true,
      });
    }

    if (carteira_jg1 < money) {
      return interaction.editReply(
        `${this.client.emoji.error} **-** ${
          interaction.user
        }, Você não possui **${money.toLocaleString()} Gelitos** para poder apostar com \`${
          userU.tag
        }\`.`
      );
    }

    if (carteira_jg2 < money) {
      return interaction.editReply(
        `${this.client.emoji.error} **-** ${interaction.user}, O usuário \`${
          userU.tag
        }\` não possui **${money.toLocaleString()} Gelitos** para poder apostar com você.`
      );
    }

    interaction
      .editReply({
        content: `Olá ${userU}, o usuário ${
          interaction.user
        } quer lhe desafiar em uma aposta no valor de **${money.toLocaleString()} Gelitos**, como nenhum de vocês não são usuários premium o valor da aposta sofreu uma taxa de \`5%\`, totalizando **${taxa.toLocaleString()} Gelitos**, para você aceitar esse desafio os dois devem clicar na reação "✅"`,
        fetchReply: true,
      })
      .then(async (msg) => {
        msg.react("✅");

        const filtro = (reaction, usuário) => {
          return (
            reaction.emoji.name === "✅" &&
            [interaction.user.id, userU.id].includes(usuário.id)
          );
        };

        const collector = msg.createReactionCollector({
          filter: filtro,
          time: 1000 * 60 * 10,
        });

        collector.on("collect", async (reaction) => {
          const users = reaction.users.cache.map((a) => a.id);

          if (users.includes(interaction.user.id) && users.includes(userU.id)) {
            collector.stop();

            if (userdb.dataValues.money < taxa) {
              return interaction.followUp(
                `Infelizmente ${interaction.user} não tem mais essa quantia de dinheiro para lhe pagar...`
              );
            }

            let competidores = [userU, interaction.user];
            let vencedor =
              competidores[Math.floor(Math.random() * competidores.length)];

            if (vencedor.id == userU.id) {
              interaction.followUp(
                `${
                  this.client.emoji.correct
                } **-** Parabéns! ${userU}, você acaba de ganhar o desafio do usuário ${
                  interaction.user
                }, e levou para casa um prêmio no valor de **${taxa.toLocaleString()} Gelitos**!`
              );

              let t = userdb.dataValues.tr;
              if (!t) t = [];

              let t2 = user2.dataValues.tr;
              if (!t2) t2 = [];

              t.unshift(
                `[<t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:d> <t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:t>] 📤 **|** Perdeu **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${userU.tag}\`.`
              );
              t2.unshift(
                `[<t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:d> <t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:t>] 📥 **|** Ganhou **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${
                  interaction.user.tag
                }\`.`
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money - ${taxa}`),
                  tr: t,
                },
                {
                  where: { id: interaction.user.id },
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
            } else if (vencedor.id == interaction.user.id) {
              interaction.followUp(
                `${this.client.emoji.correct} **-** Parabéns! ${
                  interaction.user
                }, você acaba de ganhar o desafio contra o usuário ${userU}, e levou para casa um prêmio no valor de **${taxa.toLocaleString()} Gelitos**!`
              );

              let t = userdb.dataValues.tr;
              if (!t) t = [];

              let t2 = user2.dataValues.tr;
              if (!t2) t2 = [];

              t.unshift(
                `[<t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:d> <t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:t>] 📥 **|** Ganhou **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${userU.tag}\`.`
              );
              t2.unshift(
                `[<t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:d> <t:${Math.ceil(
                  interaction.createdAt / 1000
                )}:t>] 📤 **|** Perdeu **${taxa.toLocaleString(
                  "en-US"
                )} Gelitos** em sua aposta contra o usuário \`${
                  interaction.user.tag
                }\`.`
              );

              await this.client.db.users.update(
                {
                  money: SQL.literal(`money + ${taxa}`),
                  tr: t,
                },
                {
                  where: { id: interaction.user.id },
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
