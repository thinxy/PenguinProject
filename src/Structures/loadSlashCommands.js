import { readdirSync as read } from "fs";

export default async (client) => {
  const Commands = [];
  read("./src/SlashCommands/").forEach(async (dir) => {
    const commands = read(`./src/SlashCommands/${dir}`);

    for (let file of commands) {
      const Query = (await import(`../SlashCommands/${dir}/${file}`)).default;
      const Command = new Query(client);
      if (Command.name) {
        Commands.push(Command);
        client.slashCommands.set(Command.name, Command);
      } else {
        continue;
      }
    }
  });

  client.on("ready", async () => {
    const guild = client.guilds.cache.get("925092527168700436");
    const guild1 = client.guilds.cache.get("1091937394367926366");
  
    guild.commands.set(Commands);
    guild1.commands.set(Commands);
    console.log(`[SLASH COMMANDS] - Foram carregados ${Commands.length} SlashCommands!`);
    //Commands.length + " Slash Commands carregados"
  });
};
