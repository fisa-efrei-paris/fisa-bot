import { register } from "./register"
import { Message } from "discord.js"
import { getGuildMember } from "../../helpers"

export const handleRegister = async (message: Message) => {
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
}
