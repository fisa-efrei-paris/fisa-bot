import { register } from "./register"
import { Message } from "discord.js"
import { getGuildMember } from "../../helpers"
import { createGroups } from "./groups"

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
    await createGroups(
      guildMember,
      message,
      message.content.replace("!groups ", "").split(" ")
    )
  }
}
