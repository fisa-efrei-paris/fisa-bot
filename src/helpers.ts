import { Guild, GuildMember, GuildMemberResolvable } from "discord.js"

export const getGuildMember = (
  guild: Guild | null,
  userId: GuildMemberResolvable
): GuildMember | null => {
  if (!guild) {
    return null
  }

  return guild.members.resolve(userId)
}
