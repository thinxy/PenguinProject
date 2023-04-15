import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
} from "discord.js";
import Commands from "../../Structures/base/Command.js";
import SQL from "sequelize";
import unabbreviate from "util-stunks/src/func/unabbreviate.js";

export default class RinhaCommand extends Commands {
  constructor(client) {
    super(client, {
      name: "rinha",
      description: "「Economia」abra uma rinha para desafiar seus amigos!",
      aliases: ['duel','batalha'],
      help: {
        usage: "{prefix}rinha <valor> [limite]",
      },
    });
  }
  async run(message, args, prefix) {
    const money = unabbreviate(args[0])
    let limite = parseInt(args[1]) || 15;

    const moneyD = parseInt(money);

    const user = await this.client.db.users.findOne({
      where: { id: message.author.id },
    });

    if (!limite) {
      return message.reply(
        `${this.client.emoji.error} **${message.author}** Coloque a quantidade de pessoas máximas que poderão participar da rinha.`
      );
    } else if (limite <= 1 || limite > 15) {
      return message.reply(
        `${this.client.emoji.error} **${message.author}** A quantidade mínima de participantes é 2 e máxima de 15.`
      );
    } else if (!money) {
      return message.reply(
        `${this.client.emoji.error} **${message.author}** Coloque a quantia que deseja apostar na rinha.`
      );
    } else if (user.dataValues.money < money) {
      return message.reply(
        `${this.client.emoji.error} **${message.author}** Você não possui essa **quantia** de moedas.`
      );
    } else if (money <= 0) {
      return message.reply(
        `${this.client.emoji.error} **${message.author}** Coloque um valor **maior** que 0.`
      );
    } else {
      /*
  else if (user.economia.rinha === true) {
        return message.reply({
          content: `${this.client.emoji.common.error} **- ${message.author}**, Você criou uma rinha há pouco tempo, espere ela acabar para participar desta.`,
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
      let array = [`${message.author.id}`];

      const apostar = new EmbedBuilder()
        .setDescription(
          `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (<:duel:1027084421268000798>), e para fechar a rinha o criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()} Gelitos**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
            message.author
          }`
        )
        .setFooter({
          text: `Clique no botão abaixo para entrar dentro da rinha.`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setColor(this.client.config.color)
        .addFields({
          name: `👥 Participantes [1/${limite}]`,
          value: `> ${message.author}`,
          inline: false,
        });

      let msg = await message.reply({
        content: `${message.author}`,
        embeds: [apostar],
        components: [row],
        fetchReply: true,
      });

      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };
      const collector = message.channel.createMessageComponentCollector({
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
              return message.reply({
                content: `${this.client.emoji.error} **-** ${message.author}, você não está registrado em minha database.`,
                ephemeral: true,
              });
            }

            if (User.dataValues.money < money) {
              return x.followUp({
                content: `${this.client.emoji.error} **- ${message.author}**, Você não tem a quantia mínima para participar.`,
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
                message.author
              }`;

              msg.edit({
                content: `${message.author}`,
                embeds: [edit1],
                components: [row],
                fetchReply: true,
              });
            }

            break;

          case "f":
            if (game === false) return;
            if (x.user.id !== message.author.id) return;
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);

            const totalmoney2 = array.length * money;

            const edit2 = msg.embeds[0].data;
            edit2.fields[0] = {
              name: `👥 Participantes: [${array.length}/${limite}]`,
              value: `\n> ${array.map((x) => `<@${x}>`).join("\n> ")}`,
            };
            edit2.description = `📣 **-** Atenção usuários, uma nova rinha foi criada! Será que você consegue encarar **${totalmoney.toLocaleString()} Gelitos**? Caso queira participar da rinha clique no botão (🐔), e para fechar a rinha  criador deve clicar no botão (✅)!\n\n**(ℹ️) Informações:**\n> **Prêmio atual:** **${totalmoney.toLocaleString()} Gelitos**\n> **Preço para entrar:** **${money.toLocaleString()} Gelitos**\n> **Acaba:** <t:${data}:R>\n> **Criador(a):** ${
              message.author
            }`;

            msg.edit({
              content: `${message.author}`,
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

              message.reply(
                `${this.client.emoji.error} **-** ${message.author}, sua rinha não teve participantes suficiente para dar um ganhador, com isso devolvemos seu dinheiro.`
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
                        message.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                        message.createdAt / 1000
                    )}:t>] 📥 **|** Ganhou **${totalmoney.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      message.author.tag
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
                        message.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                        message.createdAt / 1000
                    )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      message.author.tag
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
                        message.createdAt / 1000
                      )}:d> <t:${Math.ceil(
                        message.createdAt / 1000
                      )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                        "en-US"
                      )} Gelitos** na rinha do usuário \`${
                        message.author.tag
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

              message.channel.send(
                `**🏆 -** Parabéns ${USER}, você ganhou **${totalmoney.toLocaleString()} Gelitos**, na rinha criada pelo usuário ${
                  message.author
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
            message.author
          }`;

          msg.edit({
            content: `${message.author}`,
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

            message.reply({
              content: `${this.client.emoji.error} **-** ${message.author}, sua rinha não teve participantes suficiente para dar um ganhador, com isso devolvemos seu dinheiro.`,
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
                    message.createdAt / 1000
                  )}:d> <t:${Math.ceil(
                    message.createdAt / 1000
                  )}:t>] 📥 **|** Ganhou **${totalmoney.toLocaleString(
                    "en-US"
                  )} Gelitos** na rinha do usuário \`${message.author.tag}\`.`
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
                    message.createdAt / 1000
                  )}:d> <t:${Math.ceil(
                    message.createdAt / 1000
                  )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                    "en-US"
                  )} Gelitos** na rinha do usuário \`${message.author.tag}\`.`
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
                        message.createdAt / 1000
                    )}:d> <t:${Math.ceil(
                        message.createdAt / 1000
                    )}:t>] 📤 **|** Perdeu **${money.toLocaleString(
                      "en-US"
                    )} Gelitos** na rinha do usuário \`${
                      message.author.tag
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

            message.channel.send(
              `**🏆 -** Parabéns ${USER}, você ganhou **${totalmoney.toLocaleString()} Gelitos**, na rinha criada pelo usuário ${
                message.author
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
