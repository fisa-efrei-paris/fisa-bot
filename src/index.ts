import { Client } from "discord.js"
import { handleMessageForGithub } from "./module/github"
import { handleInternalCommand } from "./module/internal"

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./.env.local" })
  require("dotenv").config()
}

const client = new Client({ partials: ["MESSAGE"] })

client.on("ready", () => {
  if (!client.user) {
    throw new Error(`An error occurred when starting the bot.`)
  }

  console.log(`Started as ${client.user.tag}.`)
})

client.on("message", async message => {
  await handleMessageForGithub(message)
  await handleInternalCommand(message)
})

client.on("messageUpdate", async (oldMessage, newMessage) => {
  let message

  if (newMessage.partial) {
    message = await newMessage.fetch()
  } else {
    message = newMessage
  }

  if (message.reactions.cache.get("👍")?.me) {
    return
  }

  await handleMessageForGithub(message)
  await handleRegister(message)
})

client.login(process.env.CLIENT_TOKEN)
