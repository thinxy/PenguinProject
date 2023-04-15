import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";
import SlashCommand from "../../Structures/base/SlashCommand.js";
import SQL from "sequelize";

export default class PaySlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "pay",
      description: "｢Economia｣pague gelitos a um usuário.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "coloque o usuário que você deseja pagar.",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "value",
          description:
            "coloque o valor de gelitos que deseja pagar ao usuário.",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
      help: {
        usage: "/pay <@user> <valor>",
      },
    });
  }
  async run(interaction) {
    const user = interaction.options.getUser("user");
    const valor = interaction.options.getNumber("value");

    if (user.id == interaction.user.id) {
      return interaction.editReply({
        content: `${this.client.emojis.error} **-** ${interaction.user}, você não pode transferir dinheiro para si mesmo, coloque um usuário válido.`,
        ephemeral: true,
      });
    }

    const userdb = await this.client.db.users.findOne({
      where: { id: interaction.user.id },
    });

    if (!userdb || userdb.dataValues.money == 0) {
      return interaction.editReply({
        content: `${this.client.emojis.error} **-** ${interaction.user}, você não tem dinheiro suficiente para completar essa transação.`,
        ephemeral: true,
      });
    }

    if (userdb.dataValues.money < valor) {
      return interaction.editReply({
        content: `${this.client.emojis.error} **-** ${interaction.user}, você não tem dinheiro suficiente para completar essa transação.`,
        ephemeral: true,
      });
    }

    if (valor < 1) {
      return interaction.editReply({
        content: `${this.client.emojis.error} **-** ${interaction.user}, você deve colocar um valor acima de 0 para fazer a transferência.`,
        ephemeral: true,
      });
    }

    let userdb2 = await this.client.db.users.findOne({
      where: { id: user.id },
    });

    if (userdb2.dataValues.verify == false) {
      interaction.editReply({
        content: `${client.emoji.error} **-** ${interaction.user}, hm... me parece que o usuário ${user} ainda não é verificado na minha database.`,
      });
    }

    interaction
      .editReply({
        content: `💸 **-** ${user}, o usuário ${
          interaction.user
        }, quer lhe enviar um pagamento no valor de \`${valor.toLocaleString()} Gelitos\`, para confirmar esse pagamento os 2 usuários devem reagir ao emoji "💸".\n\n**Não se esqueça:** È proibido qualquer troca que possa ter valor monetário como \`(Nitro, dinheiro real, invites, conteúdo ilegal/NSFW, etc)\` por gelitos e caso venda gelitos por dinheiro real, você será banido do Penguin permanentemente! Veja todas as regras em **https://penguinbot.online/termos**.`,
        fetchReply: true,
      })
      .then((msg) => {
        msg.react("💸");

        const filter = (reaction, usuário) => {
          return (
            reaction.emoji.name === "💸" &&
            [interaction.user.id, user.id].includes(usuário.id)
          );
        };

        const collector = msg.createReactionCollector({
          filter: filter,
          time: 1000 * 60 * 10,
        });

        collector.on("collect", async (reaction) => {
          const users = reaction.users.cache.map((a) => a.id);

          if (users.includes(interaction.user.id) && users.includes(user.id)) {
            collector.stop();

            if (userdb.dataValues.money < valor) {
              return interaction.channel.send({
                embeds: [
                  new Discord.MessageEmbed()
                    .setTitle(`💸 Dinero acabou...`)
                    .setColor("a5d7ff")
                    .setDescription(
                      `Infelizmente ${interaction.user} não tem mais essa valor de dinheiro para lhe pagar...`
                    ),
                ],
              });
            }

            let t = userdb.dataValues.tr;
            if (!t) t = [];

            let t2 = userdb2.dataValues.tr;
            if (!t2) t2 = [];

            t.unshift(
              `[<t:${Math.ceil(interaction.createdAt / 1000)}:d> <t:${Math.ceil(
                interaction.createdAt / 1000
              )}:t>] 📤 **|** Enviou um pagamento de **${valor.toLocaleString(
                "en-US"
              )} Gelitos** para o usuário \`${user.tag}\`.`
            );
            t2.unshift(
              `[<t:${Math.ceil(interaction.createdAt / 1000)}:d> <t:${Math.ceil(
                interaction.createdAt / 1000
              )}:t>] 📥 **|** Recebeu um pagamento de **${valor.toLocaleString(
                "en-US"
              )} Gelitos** do usuário \`${
                interaction.user.tag
              }\`.`
            );

            await this.client.db.users.update(
              {
                money: SQL.literal(`money - ${valor}`),
                tr: t,
              },
              {
                where: { id: interaction.user.id },
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

            interaction.channel.send({
              content: `💸 **-** Prontinho ${user}, você acaba de receber \`${valor.toLocaleString()} Gelitos\` do usuário ${
                interaction.user
              }!`,
            });
          }
        });
      });
  }
}
