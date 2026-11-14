

const http = require("node:http");

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// Kleine webserver voor Render
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Fortnite Discord Bot is running!");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Webserver gestart op poort ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Bekijk de Fortnite Item Shop"),

  new SlashCommandBuilder()
    .setName("tournaments")
    .setDescription("Bekijk aankomende Fortnite toernooien")
].map(command => command.toJSON());

async function getShop() {
  const response = await fetch(
    "https://itemshop.gg/api/v1/shop/fortnite"
  );

  if (!response.ok) {
    throw new Error("Shop tijdelijk niet beschikbaar");
  }

  return response.json();
}

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  try {
    if (interaction.commandName === "shop") {
      const result = await getShop();
      const shop = result.data;

      const embed = new EmbedBuilder()
        .setTitle("Fortnite Item Shop")
        .setDescription(
          `Shopdatum: ${shop.shopDate}\nAantal items: ${shop.itemCount}`
        )
        .setColor(0x9b59b6)
        .setURL("https://itemshop.gg");

      if (shop.images?.[0]) {
        embed.setImage(shop.images[0]);
      }

      embed.setFooter({
        text: "Data from itemshop.gg"
      });

      await interaction.editReply({ embeds: [embed] });
    }

    if (interaction.commandName === "tournaments") {
      const embed = new EmbedBuilder()
        .setTitle("Fortnite EU Toernooien")
        .setDescription(
          "Bekijk de officiële planning van aankomende Fortnite-toernooien."
        )
        .setColor(0x3498db)
        .setURL("https://www.fortnite.com/competitive/events");

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "Er ging iets mis. Probeer het later opnieuw."
    );
  }
});

async function start() {
  if (
    !process.env.DISCORD_TOKEN ||
    !process.env.CLIENT_ID ||
    !process.env.GUILD_ID
  ) {
    throw new Error("Een Render environment variable ontbreekt.");
  }

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(error => {
  console.error("Bot kon niet starten:", error);
  process.exit(1);
});
