
const http = require("node:http");

const {
  Client,
  GatewayIntentBits,
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

// Discord bot
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Bot online
client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("error", error => {
  console.error("Discord fout:", error);
});

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

// Bot starten zonder commands opnieuw te registreren
async function start() {
  console.log("Bot start...");

  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN ontbreekt.");
  }

  console.log("Discord probeert nu in te loggen...");

  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(error => {
  console.error("BOT START FOUT:", error);
  process.exit(1);
});
