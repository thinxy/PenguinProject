import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
} from "discord.js";
import SlashCommands from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class RinhaSlashCommand extends SlashCommands {
  constructor(client) {
    super(client, {
      name: "rinha",
      description: "「Economia」abra uma rinha para desafiar seus amigos!",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "valor",
          description: "coloque o valor que deseja na rinha.",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "limite",
          description: "coloque o limite de usuários para entrar na rinha.",
          type: ApplicationCommandOptionType.Number,
          required: false,
        },
      ],
      help: {
        usage: "/rinha <valor> [limite]",
      },
    });
  }
  async run(interaction, prefix) {
    const money = interaction.options.getNumber("valor");
    let limite = interaction.options.getNumber("limite") || 15;

    const moneyD = parseInt(money);

    const user = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    if (!limite) {
      return interaction.editReply(
        `${this.client.emoji.error} **${interaction.user}** Coloque a quantidade de pessoas máximas que poderão participar da rinha.`
      );
    } else if (limite <= 1 || limite > 15) {
      return interaction.editReply(
        `${this.client.emoji.error} **${interaction.user}** A quantidade mínima de participantes é 2 e máxima de 15.`
      );
    } else if (!money) {
      return interaction.editReply(
        `${this.client.emoji.error} **${interaction.user}** Coloque a quantia que deseja apostar na rinha.`
      );
    } else if (user.dataValues.money < money) {
      return interaction.editReply(
        `${this.client.emoji.error} **${interaction.user}** Você não possui essa **quantia** de moedas.`
      );
    } else if (money <= 0) {
      return interaction.editReply(
        `${this.client.emoji.error} **${interaction.user}** Coloque um valor **maior** que 0.`
      );
    } else {
      /*
else if (user.economia.rinha === true) {
      return interaction.editReply({
        content: `${this.client.emoji.common.error} **- ${interaction.user}**, Você criou uma rinha há pouco tempo, espere ela acabar para participar desta.`,
      })
    }*/

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("<:duel:1027084421268000798>")
          .setLabel("Entrar na Rinha")
          .setCustomId("y"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setEmoji("✅")
          .setLabel("Finalizar")
          .setCustomId("f")
      );

      let totalmoney = money;

      let data = ~~((Date.now() + 60000) / 1000);
      let array = [`${interaction.user.id}`];

      const apostar = new EmbedBuilder()
        .setDescription(
          `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (<:duel:1027084421268000798>), e para fechar a rinha o criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()} Gelitos**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
            interaction.user
          }`
        )
        .setFooter({
          text: `Clique no botão abaixo para entrar dentro da rinha.`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor(this.client.config.color)
        .addFields({
          name: `👥 Participantes [1/${limite}]`,
          value: `> ${interaction.user}`,
          inline: false,
        });

      let msg = await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [apostar],
        components: [row],
        fetchReply: true,
      });

      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });
      let game = true;

      collector.on("collect", async (x) => {
        await x.deferUpdate();

        switch (x.customId) {
          case "y":
            const User = await this.client.db.users.findOne({
              where: { id: x.user.id },
            });

            /*
            if (array.length = limite) {
              return x.followUp({
                content: `${this.client.emoji.error} **- ${x.user}**, Esta rinha já está **cheia**.`,
                ephemeral: true,
              });
            }
            */

            if (!User) {
              return interaction.editReply({
                content: `${this.client.emoji.error} **-** ${interaction.user}, você não está registrado em minha database.`,
                ephemeral: true,
              });
            }

            if (User.dataValues.money < money) {
              return x.followUp({
                content: `${this.client.emoji.error} **- ${interaction.user}**, Você não tem a quantia mínima para participar.`,
                ephemeral: true,
              });
            } else if (array.includes(x.user.id)) {
              return x.followUp({
                content: `${this.client.emoji.error} **- ${x.user}**, Você já está **participando** desta rinha!`,
                ephemeral: true,
              });
            } else {
              let desc;

              array.push(x.user.id);

              if (array.length == limite) {
                collector.stop();
              }

              x.followUp({
                content: `${this.client.emoji.correct} **- ${x.user}**, Você entrou na **Rinha de Emoji** com sucesso, espere o tempo acabar e boa sorte!`,
                ephemeral: true,
              });
              totalmoney = array.length * money;

              const totalmoney2 = array.length * money;

              const edit1 = msg.embeds[0].data;
              edit1.fields[0] = {
                name: `👥 Participantes: [${array.length}/${limite}]`,
                value: `\n> ${array.map((x) => `<@${x}>`).join("\n> ")}`,
              };
              edit1.description = `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney2.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (🐔), e para fechar a rinha o criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney2.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()}**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
                interaction.user
              }`;

              msg.edit({
                content: `${interaction.user}`,
                embeds: [edit1],
                components: [row],
                fetchReply: true,
              });
            }

            break;

          case "f":
            if (game === false) return;
            if (x.user.id !== interaction.user.id) return;
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);

            const totalmoney2 = array.length * money;

            const edit2 = msg.embeds[0].data;
            edit2.fields[0] = {
              name: `👥 Participantes: [${array.length}/${limite}]`,
              value: `\n> ${array.map((x) => `<@${x}>`).join("\n> ")}`,
            };
            edit2.description = `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (🐔), e para fechar a rinha  criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()} Gelitos**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
              interaction.user
            }`;

            msg.edit({
              content: `${interaction.user}`,
              embeds: [edit2],
              components: [],
              fetchReply: true,
            });

            var result = array[Math.floor(Math.random() * array.length)];

            const USER = await this.client.users.fetch(result);
            const winner = await this.client.users.fetch(result);
            const uSer = await this.client.db.users.findOne({
              where: { id: USER.id },
            });

            if (array.length <= 1) {
              game = false;

              interaction.followUp(
                `${this.client.emoji.error} **-** ${interaction.user}, sua rinha não teve participantes suficiente para dar um ganhador, com isso devolvemos seu dinheiro.`
              );
              return;
            } else {
              array.forEach(async (p) => {
                if (p == winner.id) {
                  let userDB = await this.client.db.users.findOne({
                    where: { id: winner.id },
                  });

                  let t = userDB.dataValues.tr;
                  if (!t) t = [];

                  t.unshift(
                    `[<t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:t>] 📥 **|** Ganhou **${totalmoney.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      interaction.user.tag
                    }\`.`
                  );

                  await this.client.db.users.update(
                    {
                      money: SQL.literal(`money + ${totalmoney}`),
                      tr: t,
                    },
                    {
                      where: { id: winner.id },
                    }
                  );
                } else if (p != winner.id) {
                  let user2 = await this.client.db.users.findOne({
                    where: { id: p },
                  });
                  let t = user2.dataValues.tr;
                  if (!t) t = [];

                  t.unshift(
                    `[<t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      interaction.user.tag
                    }\`.`
                  );

                  if (user2.dataValues.money <= money) {
                    // seta as moeda dela pra 0

                    await this.client.db.users.update(
                      {
                        money: 0,
                        tr: t,
                      },
                      {
                        where: { id: p },
                      }
                    );
                  } else {
                    // tira o valor da rinha do saldo
                    let t = user2.dataValues.tr;
                    if (!t) t = [];

                    t.unshift(
                      `[<t:${Math.ceil(
                        interaction.createdAt / 1000
                      )}:d> <t:${Math.ceil(
                        interaction.createdAt / 1000
                      )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                        "en-US"
                      )} Gelitos** na rinha do usuário \`${
                        interaction.user.tag
                      }\`.`
                    );

                    await this.client.db.users.update(
                      {
                        money: SQL.literal(`money - ${money}`),
                        tr: t,
                      },
                      {
                        where: { id: p },
                      }
                    );
                  }
                }
              });

              game = false;

              interaction.channel.send(
                `**🏆 -** Parabéns ${USER}, você ganhou **${totalmoney.toLocaleString()} Gelitos**, na rinha criada pelo usuário ${
                  interaction.user
                } e os outros \`${
                  array.length - 1
                } participantes\` perderam o valor de **${money.toLocaleString()} Gelitos**.`
              );
              break;
            }
        }
      });
      collector.on("end", async () => {
        if (game === true) {
          if (game === false) return;
          const totalmoney2 = array.length * money;
          const money1 = money;

          const edit10 = msg.embeds[0].data;
          edit10.fields[0] = {
            name: `👥 Participantes: [${array.length}/${limite}]`,
            value: `\n> ${array.map((x) => `<@${x}>`).join("\n> ")}`,
          };
          edit10.description = `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney2.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (🐔), e para fechar a rinha o criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney2.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()}**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
            interaction.user
          }`;

          msg.edit({
            content: `${interaction.user}`,
            embeds: [edit10],
            components: [],
            fetchReply: true,
          });

          var result = array[Math.floor(Math.random() * array.length)];

          const USER = await this.client.users.fetch(result);
          const winner = await this.client.users.fetch(result);
          const uSer = await this.client.db.users.findOne({
            userID: winner.id,
          });

          const users = array.length;

          if (array.length <= 1) {
            game = false;

            interaction.followUp({
              content: `${this.client.emoji.error} **-** ${interaction.user}, sua rinha não teve participantes suficiente para dar um ganhador, com isso devolvemos seu dinheiro.`,
            });
            return;
          } else {
            array.forEach(async (p) => {
              if (p == winner.id) {
                let userDB = await this.client.db.users.findOne({
                  where: { id: winner.id },
                });

                let t = userDB.dataValues.tr;
                if (!t) t = [];

                t.unshift(
                  `[<t:${Math.ceil(
                    interaction.createdAt / 1000
                  )}:d> <t:${Math.ceil(
                    interaction.createdAt / 1000
                  )}:t>] 📥 **|** Ganhou **${totalmoney.toLocaleString(
                    "en-US"
                  )} Gelitos** na rinha do usuário \`${interaction.user.tag}\`.`
                );

                await this.client.db.users.update(
                  {
                    money: SQL.literal(`money + ${totalmoney}`),
                    tr: t,
                  },
                  {
                    where: { id: winner.id },
                  }
                );
              } else if (p != winner.id) {
                let user2 = await this.client.db.users.findOne({
                  where: { id: p },
                });
                let t = user2.dataValues.tr;
                if (!t) t = [];

                t.unshift(
                  `[<t:${Math.ceil(
                    interaction.createdAt / 1000
                  )}:d> <t:${Math.ceil(
                    interaction.createdAt / 1000
                  )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                    "en-US"
                  )} Gelitos** na rinha do usuário \`${interaction.user.tag}\`.`
                );

                if (user2.dataValues.money <= money) {
                  // seta as moeda dela pra 0

                  await this.client.db.users.update(
                    {
                      money: 0,
                      tr: t,
                    },
                    {
                      where: { id: p },
                    }
                  );
                } else {
                  // tira o valor da rinha do saldo
                  let t = user2.dataValues.tr;
                  if (!t) t = [];

                  t.unshift(
                    `[<t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                      interaction.createdAt / 1000
                    )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      interaction.user.tag
                    }\`.`
                  );

                  await this.client.db.users.update(
                    {
                      money: SQL.literal(`money - ${money}`),
                      tr: t,
                    },
                    {
                      where: { id: p },
                    }
                  );
                }
              }
            });
            game = false;

            interaction.channel.send(
              `**🏆 -** Parabéns ${USER}, você ganhou **${totalmoney.toLocaleString()} Gelitos**, na rinha criada pelo usuário ${
                interaction.user
              } e os outros \`${
                array.length - 1
              } participantes\` perderam o valor de **${money.toLocaleString()} Gelitos**.`
            );
          }
        }
      });
    }
  }
}
