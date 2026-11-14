
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
  console.error("Discord fout:", error.code, error.message);
});

client.on("shardError", error => {
  console.error("Gateway fout:", error.code, error.message);
});

async function start() {
  console.log("Bot start...");

  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    throw new Error("DISCORD_TOKEN ontbreekt in Render.");
  }

  console.log("Token gevonden. Lengte:", token.length);
  console.log("Discord login wordt gestart...");

  try {
    await client.login(token);
    console.log("Discord login geslaagd!");
  } catch (error) {
    console.error("LOGIN FOUT:", error.code, error.message);
    process.exit(1);
  }
}

start().catch(error => {
  console.error("START FOUT:", error.message);
  process.exit(1);
});
