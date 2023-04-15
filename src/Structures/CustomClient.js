import { Client, Collection, GatewayIntentBits } from "discord.js";
import LoadCommands from "./loadCommands.js";
import LoadSlashCommands from "./loadSlashCommands.js";
import Users from "../Database/users.js";
import Ruffle from "../Database/ruffle.js";
import Guilds from "../Database/guilds.js";
import { readFileSync } from "fs";
import connection from "../Events/Listerners/connectdb.js"
const config = JSON.parse(readFileSync("./config.json", "utf8"));
const emoji = JSON.parse(readFileSync("./src/Utils/Emojis.json", "utf8"));
const badge = JSON.parse(readFileSync("./src/Utils/Badges.json", "utf8"));

class CustomClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.commands = new Collection();
    this.aliases = new Collection();
    this.slashCommands = new Collection();
    this.blackjack = new Collection();
    this.config = config;
    this.badges = badge
    this.db = {
      users: Users,
      ruffle: Ruffle,
      guilds: Guilds,
      sql: connection
    };
    this.emoji = emoji;
  }

  async start() {
    LoadCommands(this);
    LoadSlashCommands(this);
    await import("../Events/index.js");
    return await super.login(config.TOKEN);
  }
}

export default CustomClient;
