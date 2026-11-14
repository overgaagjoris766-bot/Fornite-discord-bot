
const http = require("node:http");
const { Client, GatewayIntentBits } = require("discord.js");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Fortnite bot werkt!");
}).listen(PORT, "0.0.0.0", () => {
  console.log("Webserver gestart:", PORT);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log("BOT ONLINE:", client.user.tag);
});

client.on("error", error => {
  console.error("Discord fout:", error.message);
});

async function start() {
  console.log("Bot start...");

  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN ontbreekt in Render.");
  }

  await client.login(process.env.DISCORD_TOKEN);
  console.log("Discord login geslaagd!");
}

start().catch(error => {
  console.error("LOGIN FOUT:", error.message);
  process.exit(1);
});
