import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonStyle,
  MessageCollector,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
//import { unabbreviate, abbreviate, durationTime } from "util-stunks";
import sql from "sequelize"
import SlashCommand from "../../Structures/base/SlashCommand.js";
import client from "../../../index.js";

export default class BJSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "blackjack",
      description: "｢economia｣aposte contra o bot em um 21.",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
            name: "value",
            description: "coloque o valor da aposta.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
      ],
      help: {
        usage: "/blackjack <value>",
      },
    });
  }
  async run(interaction) {
    let buttons = (stts) => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setLabel("Comprar")
          .setEmoji("💸")
          .setCustomId("buy")
          .setDisabled(stts),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Passar a vez")
          .setEmoji("➡️")
          .setCustomId("pass")
          .setDisabled(stts)
      ),
    ];

    let doc = await client.db.users.findOne({
        where: { id: interaction.user.id }
    })
    let block = client.blackjack.get(interaction.user.id);

    let value = interaction.options.getNumber('value')

    if (!value)
      return interaction.editReply(
        `${client.emoji.error} **-** ${interaction.user}, diga-me quanto você deseja apostar.`
      );
    if (isNaN(value))
      return interaction.editReply(
        `${client.emoji.error} **-** ${interaction.user}, o value precisa ser uma quantia númerica.`
      );
    if (value < 20 || value > 100000)
      return interaction.editReply(
        `${client.emoji.error} **-** ${interaction.user}, o valor da aposta precisa ser entre **20** e **100.000** Gelitos.`
      );
    if (value > doc.dataValues.money)
      return interaction.editReply(
        `${client.emoji.error} **-** ${
          interaction.user
        }, você não tem tantos Gelitos para apostar.`
      );
    if (block?.isBlock == true)
      return interaction.editReply(
        `${client.emoji.error} **-** ${interaction.user}, você já tem um jogo ativo, termine-o antes de executar um novo.`
      );

    client.blackjack.set(interaction.user.id, { isBlock: true });

    var numCardsPulled = 0;
    var gameOver = false;

    var player = {
      cards: [],
      score: 0,
    };
    var dealer = {
      cards: [],
      score: 0,
    };

    function getCardsValue(a) {
      var cardArray = [],
        sum = 0,
        i = 0,
        dk = 10.5,
        doubleking = "QQ",
        aceCount = 0;
      cardArray = a;
      for (i; i < cardArray.length; i += 1) {
        if (
          cardArray[i].rank === "J" ||
          cardArray[i].rank === "Q" ||
          cardArray[i].rank === "K"
        ) {
          sum += 10;
        } else if (cardArray[i].rank === "A") {
          sum += 11;
          aceCount += 1;
        } else if (cardArray[i].rank === doubleking) {
          sum += dk;
        } else {
          sum += cardArray[i].rank;
        }
      }
      while (aceCount > 0 && sum > 21) {
        sum -= 10;
        aceCount -= 1;
      }
      return sum;
    }

    var deck = {
      deckArray: [],
      initialize: function () {
        var suitArray, rankArray, s, r, n;
        suitArray = ["Paus", "Ouros", "Corações", "Espadas"];
        rankArray = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
        n = 13;
        for (s = 0; s < suitArray.length; s += 1) {
          for (r = 0; r < rankArray.length; r += 1) {
            this.deckArray[s * n + r] = {
              rank: rankArray[r],
              suit: suitArray[s],
            };
          }
        }
      },
      shuffle: function () {
        var temp, i, rnd;
        for (i = 0; i < this.deckArray.length; i += 1) {
          rnd = Math.floor(Math.random() * this.deckArray.length);
          temp = this.deckArray[i];
          this.deckArray[i] = this.deckArray[rnd];
          this.deckArray[rnd] = temp;
        }
      },
    };

    deck.initialize();
    deck.shuffle();

    var msgEmbed = await interaction.editReply(
      `${client.emoji.correct} **-** ${interaction.user}, embaralhando cartas...`
    );

    async function bet(outcome) {

      if (outcome === "win") {
        await client.db.users.update({
            money: sql.literal(`money + ${value}`)
        },
        {
            where: { id: interaction.user.id }
        })

        interaction.editReply(
          `${client.emoji.correct} **-** ${
            interaction.user
          }, você ganhou \`${value.toLocaleString()} Gelitos\`.`
        );

        client.blackjack.set(interaction.user.id, { isBlock: false });
      }
      if (outcome === "lose") {
        await client.db.users.update({
            money: sql.literal(`money - ${value}`)
        },
        {
            where: { id: interaction.user.id }
        })

        interaction.editReply(
          `${client.emoji.error} **-** ${
            interaction.user
          }, você perdeu \`${value.toLocaleString()} Gelitos\`.`
        );

        client.blackjack.set(interaction.user.id, { isBlock: false });
      }
    }

    function resetGame() {
      numCardsPulled = 0;
      player.cards = [];
      dealer.cards = [];
      player.score = 0;
      dealer.score = 0;
      deck.initialize();
    }

    async function endMsg(title, msg, dealerC) {
      let cardsMsg = "";
      player.cards.forEach(function (card) {
        cardsMsg += " | " + card.rank.toString();
        if (card.suit == "Corações") cardsMsg += "♥";
        if (card.suit == "Ouros") cardsMsg += "♦";
        if (card.suit == "Espadas") cardsMsg += "♠";
        if (card.suit == "Paus") cardsMsg += "♣";
        cardsMsg;
      });
      cardsMsg += " --> " + player.score.toString();

      let dealerMsg = "";
      if (!dealerC) {
        dealerMsg = dealer.cards[0].rank.toString();
        if (dealer.cards[0].suit == "Corações") dealerMsg += "♥";
        if (dealer.cards[0].suit == "Ouros") dealerMsg += "♦";
        if (dealer.cards[0].suit == "Espadas") dealerMsg += "♠";
        if (dealer.cards[0].suit == "Paus") dealerMsg += "♣";
        dealerMsg;
      } else {
        dealerMsg = "";
        dealer.cards.forEach(function (card) {
          dealerMsg += " | " + card.rank.toString();
          if (card.suit == "Corações") dealerMsg += "♥ ";
          if (card.suit == "Ouros") dealerMsg += "♦";
          if (card.suit == "Espadas") dealerMsg += "♠";
          if (card.suit == "Paus") dealerMsg += "♣";
          dealerMsg;
        });
        dealerMsg += " --> " + dealer.score.toString();
      }

      const gambleEmbed = new EmbedBuilder()

        .setFooter({
          text: `Utilizado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor(client.config.color)
        .setTimestamp()

        .setTitle(
          `${client.emoji.coin} **-** Mesa de Jogo `
        )
        .addFields([
          { name: "Suas Cartas", value: cardsMsg, inline: true },
          { name: "Cartas do Oponente", value: dealerMsg, inline: true },
          { name: title, value: msg },
        ]);

      msgEmbed?.edit({
        content: interaction.user.toString(),
        embeds: [gambleEmbed],
        components: gameOver ? [] : buttons(false),
      });
    }

    async function endGame() {
      if (player.score === 21) {
        bet("win");
        gameOver = true;
        await endMsg(
          "Você ganhou!",
          `> Você tem 21 pontos e por isso ganhou automáticamente, você ganhou **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (player.score > 21) {
        bet("lose");
        gameOver = true;
        await endMsg(
          "Você perdeu!",
          `> Você passou dos 21 pontos e por isso perdeu, você perdeu **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (dealer.score === 21) {
        bet("lose");
        gameOver = true;
        await endMsg(
          "Você perdeu!",
          `> O seu oponente atingiu 21 pontos, você perdeu **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (dealer.score > 21) {
        bet("win");
        gameOver = true;
        await endMsg(
          "Você ganhou!",
          `> O seu oponente passou dos 21 pontos, você ganhou **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (
        dealer.score >= 17 &&
        player.score > dealer.score &&
        player.score < 21
      ) {
        bet("win");
        gameOver = true;
        await endMsg(
          "Você ganhou!",
          `> Você ganhou a partida contra seu oponente por obter uma pontuação maior que a dele, você ganhou **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (
        dealer.score >= 17 &&
        player.score < dealer.score &&
        dealer.score < 21
      ) {
        bet("lose");
        gameOver = true;
        await endMsg(
          "Você perdeu!",
          `> O seu oponente obteve uma pontuação maior que a sua e por isso ganhou, você perdeu **${value.toLocaleString(
            "de-DE"
          )} Gelitos**.`,
          true
        );
        return;
      }
      if (
        dealer.score >= 17 &&
        player.score === dealer.score &&
        dealer.score < 21
      ) {
        gameOver = true;
        await endMsg(
          "Houve um Empate!",
          `> Você e o seu oponente empataram, suas **${value.toLocaleString(
            "de-DE"
          )} Gelitos** foram devolvidas.`,
          true
        );
        client.blackjack.set(interaction.user.id, { isBlock: false });
        return;
      }
      loop();
    }

    function dealerDraw() {
      dealer.cards.push(deck.deckArray[numCardsPulled]);
      dealer.score = getCardsValue(dealer.cards);
      numCardsPulled += 1;
    }

    function newGame() {
      hit();
      hit();
      dealerDraw();
      endGame();
    }

    function hit() {
      player.cards.push(deck.deckArray[numCardsPulled]);
      player.score = getCardsValue(player.cards);

      numCardsPulled += 1;
      if (numCardsPulled > 2) {
        endGame();
      }
    }

    function stand() {
      while (dealer.score < 17) {
        dealerDraw();
      }
      endGame();
    }

    newGame();
    async function loop() {
      if (gameOver) return;

      endMsg(
        "Como Jogar?",
        `> Use os botões abaixo para jogar: \`\`comprar\`\` para comprar e \`\`passar\`\` para passar a vez! Lembre-se, esse jogo está valendo **${value.toLocaleString(
          "de-DE"
        )} Gelitos**.`,
        false
      );

      let collector = msgEmbed?.createMessageComponentCollector({
        filter: (x) => x.user.id === interaction.user.id,
        idle: 60000,
      });

      collector.on("collect", async (int) => {
        await int.deferUpdate().catch(() => {});
        if (int.user.id !== interaction.user.id) return;
        collector.stop("s");
        if (int.customId == "buy") {
          hit();
          return;
        } else if (int.customId === "pass") {
          stand();
          return;
        } else {
          collector.stop();
          return msg?.reply(
            `${client.emoji.error} **-** ${
              interaction.user
            }, seu jogo foi cancelado, suas **${value.toLocaleString(
              "de-DE"
            )} Gelitos** foram devolvidas.`
          );
        }
      });

      collector.on("end", async (c, m) => {
        if (m != "s") {
          await msgEmbed.edit({ components: [] }).catch(() => {});
          stand();
          clientblackjack.set(interaction.user.id, { isBlock: false });
        }
      });
    }
  }
}
