import { GuildMember, Message } from "discord.js"
import { ActionCallback } from "../../command"
import { getRoleFromMention } from "../../helpers"
import { loadConfiguration } from "../index"

const config = loadConfiguration("register")

export const register: ActionCallback = async (
  caller: GuildMember,
  message: Message,
  args: string[]
) => {
  if (args.length < 1) {
    await message.react("👎")
    return
  }

  if (!caller.guild.roles.cache.find(role => !config.mods.includes(role.id))) {
    await message.react("👎")
    return
  }

  const roleFromMention = getRoleFromMention(caller.guild.roles, args[0])

  if (!roleFromMention || !config.roles.includes(roleFromMention.id)) {
    await message.react("👎")
    return
  }

  const validationMessage = await message.channel.send({
    content: "Êtes-vous sur ? (ça va ping du monde)"
  })

  await Promise.all([
    validationMessage.react("👍"),
    validationMessage.react("👎")
  ])

  try {
    const choice = await validationMessage.awaitReactions(
      (reaction, user) =>
        user.id == message.author.id &&
        (reaction.emoji.name == "👍" || reaction.emoji.name == "👎"),
      { max: 1, time: 30000 }
    )

    if (choice.first()?.emoji.name === "👍") {
      for (let i = 0; i < config.ping; i++) {
        await message.channel.send({
          content: `${args[0]} AAAAAAPPPPPPPPEEEEEELLLLLLLLL !`
        })
      }
    }
  } catch (e) {}

  await validationMessage.delete()
}
