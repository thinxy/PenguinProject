import client from "../../../index.js";

client.on("ready", async () => {
  const clientdb = await client.db.users.findOrCreate({
    where: { id: client.user.id },
  });

  const server = client.guilds.cache.get('1091937394367926366');
  const canal = client.channels.cache.get('1094123017136771233')


  let bitcoinPrice = 500000;

  setInterval(async () => {
    const change = Math.floor(Math.random() * 100000) - 10000;

    bitcoinPrice += change;

    canal.send(`Preço do Bitcoin fictício: ${bitcoinPrice}`);

    await client.db.users.update(
      {
        bitcoinValue: bitcoinPrice,
        bitcoinTime: parseInt(Date.now() + 604800000)
      },
      {
        where: { id: client.user.id },
      }
    );
  }, 604800000);
});
