import invite from "./invite"
import { Message } from "discord.js"
import { getGuildMember } from "../../helpers"

export const handleMessageForGithub = async (message: Message) => {
  const guildMember = getGuildMember(message.guild, message.author)

  if (!guildMember) {
    return
  }

  if (message.content.startsWith("!invite")) {
    await invite(
      guildMember,
      message,
      message.content.replace("!invite ", "").split(" ")
    )
  }
}

export { invite }
