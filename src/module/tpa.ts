import { loadConfiguration } from "./"
import { schedule } from "node-cron"
import { Client, Guild, MessageEmbed, Role, TextChannel } from "discord.js"

const config: {
  cron: string
  url: string
  channels: { role: string; channel: string }[]
} = loadConfiguration("tpa")

export function generatedEmbed(role: Role) {
  return new MessageEmbed({
    title: `Rappel fiche présence TPA`,
    color: role.color,
    description: `N'oubliez pas de remplir la fiche de présence pour le TPA.`,
    url: config.url
  })
}

export function initCronTask(client: Client, guild: Guild) {
  console.log(`Scheduling cron task 'TPA' for guild: ${guild.name}`)

  schedule(
    config.cron,
    () => {
      console.log(`Running cron task 'TPA' for guild: ${guild.name}`)
      for (const rc of config.channels) {
        const channel = client.channels.cache.get(rc.channel)
        if (!channel || !(channel instanceof TextChannel)) {
          console.error(
            `Failed to send TPA notification in channel ${rc.channel}`
          )
          continue
        }
        const role = guild.roles.cache.get(rc.role)
        if (!role) {
          console.error(`Failed to send TPA notification to role ${rc.role}`)
          continue
        }
        channel.send({ content: `${role}`, embed: generatedEmbed(role)})
      }
    },
    {
      timezone: "Europe/Paris"
    }
  )
}
