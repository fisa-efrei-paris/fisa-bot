import { register } from "./register"
import { Message } from "discord.js"
import { getGuildMember } from "../../helpers"
import { closeGroup, createGroups } from "./groups"

export const handleInternalCommand = async (message: Message) => {
  const guildMember = getGuildMember(message.guild, message.author)

  if (!guildMember) {
    return
  }

  if (message.content.startsWith("!appel")) {
    await register(
      guildMember,
      message,
      message.content.replace("!appel ", "").split(" ")
    )
  }

  if (message.content.startsWith("!groups")) {
    const args = message.content.replace("!groups ", "").split(" ")

    if (args.length === 0) {
      return
    }

    if (args[0] === "create") {
      await createGroups(guildMember, message, args.splice(1))
    } else if (args[0] === "close") {
      await closeGroup(guildMember, message, args.splice(1))
    }
  }
}
