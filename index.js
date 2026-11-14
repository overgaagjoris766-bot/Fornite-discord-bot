
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

client.on("shardReady", () => {
  console.log("Discord Gateway is verbonden.");
});

client.on("shardDisconnect", (event) => {
  console.log("Discord verbinding verbroken. Code:", event.code);
});

client.on("shardError", (error) => {
  console.log("Gateway fout:", error.message);
});

client.on("error", (error) => {
  console.log("Discord fout:", error.message);
});

async function start() {
  console.log("Bot start...");

  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    throw new Error("DISCORD_TOKEN ontbreekt.");
  }

  try {
    const response = await fetch("https://discord.com/api/v10/gateway");
    console.log("Discord API status:", response.status);
    await response.text();

    console.log("Discord login wordt gestart...");
    await client.login(token);
    console.log("Discord login geslaagd!");
  } catch (error) {
    console.log("FOUT:", error.message);
  }
}

start();
