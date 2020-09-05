import { Client } from "discord.js"

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./.env.local" })
  require("dotenv").config()
}

const client = new Client()

client.on('ready', () => {
  console.log(`Bot v${process.env.VERSION} started as ${client.user?.tag}`)
  client.user?.setUsername("actions")
  client.user?.setPresence({
    activity: {
      name: `v${process.env.VERSION}`,
      type: "PLAYING"
    }
  })
})

client.login(process.env.TOKEN)
