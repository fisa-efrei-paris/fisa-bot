import { Client } from "discord.js"
import { handleMessageForGithub } from "./module/github"
import { handleRegister } from "./module/internal"

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./.env.local" })
  require("dotenv").config()
}

const client = new Client()

client.on("ready", () => {
  if (!client.user) {
    throw new Error(`An error occurred when starting the bot.`)
  }

  console.log(`Started as ${client.user.tag}.`)
})

client.on("message", async message => {
  await handleMessageForGithub(message)
  await handleRegister(message)
})

client.login(process.env.CLIENT_TOKEN)
