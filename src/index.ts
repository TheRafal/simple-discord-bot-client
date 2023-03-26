import { Client } from "discord.js";
import { createInterface } from "readline";
import dotenv from "dotenv";
import logger from "./utils/logger";

dotenv.config();

const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

const inquirer = createInterface({
    input: process.stdin,
    output: process.stdout
});

async function promptForMessageType() {
    return new Promise<string>((resolve) => {
        inquirer.question("(dm/channel/quit): ", (type: string) => {
            resolve(type);
        });
    });
}

async function promptForUserId() {
    return new Promise<string>((resolve) => {
        inquirer.question("user id: ", (id: string) => {
            resolve(id);
        });
    });
}

async function promptForMessage() {
    return new Promise<string>((resolve) => {
        inquirer.question("message: ", (message: string) => {
            resolve(message);
        });
    });
}

async function promptForGuildId() {
    return new Promise<string>((resolve) => {
        inquirer.question("guild id: ", (id: string) => {
            resolve(id);
        });
    });
}

async function promptForChannelId() {
    return new Promise<string>((resolve) => {
        inquirer.question("channel id: ", (id: string) => {
            resolve(id);
        });
    });
}

async function sendMessageToUser(userId: string, message: string) {
    try {
        const user = await client.users.fetch(userId);
        await user.send(message);
        logger.info("Message sent");
    } catch (err) {
        logger.error("Message failed to send");
        logger.error(err);
    }
}

async function sendMessageToChannel(guildId: string, channelId: string, message: string) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);
        if(!channel) throw new Error("Channel not found");
        if(!channel.isTextBased()) throw new Error("Channel is not text based");
        await channel.send(message);
        logger.info("Message sent");
    } catch (err) {
        logger.error("Message failed to send");
        logger.error(err);
    }
}

client.on("ready", () => {
    logger.info("Ready");
    tbClient();
});

async function tbClient() {
    const type = await promptForMessageType();
    if (type === "dm") {
        const userId = await promptForUserId();
        const message = await promptForMessage();
        await sendMessageToUser(userId, message);
    } else if (type === "channel" || type === "ch") {
        const guildId = await promptForGuildId();
        const channelId = await promptForChannelId();
        const message = await promptForMessage();
        await sendMessageToChannel(guildId, channelId, message);
        const guild = await client.guilds.fetch(guildId);
        if (!guild) throw new Error("Guild not found");
        const channel = await guild.channels.fetch(channelId);
        if (!channel) throw new Error("Channel not found");
    } else if (type === "quit" || type === "q") {
        inquirer.close();
    }
    tbClient();
}

inquirer.on("close", () => {
    console.log("\n")
    logger.info("Closing");
    client.destroy();
    process.exit(0);
});

client.login(token);
