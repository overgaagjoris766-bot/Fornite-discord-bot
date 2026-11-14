
const http = require("node:http");

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// Render webserver
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Fortnite Discord Bot is running!");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Webserver gestart op poort ${PORT}`);
});

// Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Bekijk de Fortnite Item Shop"),

  new SlashCommandBuilder()
    .setName("tournaments")
    .setDescription("Bekijk Fortnite EU-toernooien")
].map(command => command.toJSON());

// Fortnite shop ophalen
async function getShop() {
  const response = await fetch(
    "https://itemshop.gg/api/v1/shop/fortnite"
  );

  if (!response.ok) {
    throw new Error("Fortnite Shop is tijdelijk niet beschikbaar");
  }

  return response.json();
}

// Discord events
client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("error", error => {
  console.error("Discord verbindingsfout:", error);
});

// Commands uitvoeren
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await interaction.deferReply();

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

      await interaction.editReply({
        embeds: [embed]
      });
    }

    else if (interaction.commandName === "tournaments") {
      const embed = new EmbedBuilder()
        .setTitle("🏆 Fortnite EU Toernooien")
        .setDescription(
          "Bekijk de officiële planning van Fortnite EU-toernooien via de link hieronder."
        )
        .setColor(0x3498db)
        .addFields({
          name: "🌍 Regio",
          value: "Europe (EU)"
        })
        .setURL("https://www.fortnite.com/competitive/events")
        .setFooter({
          text: "Officiële Fortnite Competitive-pagina"
        });

      await interaction.editReply({
        embeds: [embed]
      });
    }

  } catch (error) {
    console.error("Command error:", error);

    const message = {
      content: "Er ging iets mis. Probeer het later opnieuw.",
      embeds: []
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({
        content: message.content,
        ephemeral: true
      });
    }
  }
});

// Bot starten
async function start() {
  console.log("Bot start...");

  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN ontbreekt.");
  }

  if (!process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID ontbreekt.");
  }

  if (!process.env.GUILD_ID) {
    throw new Error("GUILD_ID ontbreekt.");
  }

  console.log("Environment Variables gevonden.");
  console.log("Slash commands registreren...");

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Slash commands geregistreerd.");
  console.log("Discord probeert nu in te loggen...");

  await client.login(process.env.DISCORD_TOKEN);

  console.log("Discord login gelukt!");
}

start().catch(error => {
  console.error("BOT START FOUT:", error);
  process.exit(1);
});
