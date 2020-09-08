import {
  Guild,
  GuildMember,
  GuildMemberResolvable,
  RoleManager
} from "discord.js"

export const getGuildMember = (
  guild: Guild | null,
  userId: GuildMemberResolvable
): GuildMember | null => {
  if (!guild) {
    return null
  }

  return guild.members.resolve(userId)
}

export const getRoleFromMention = (roles: RoleManager, mention: string) => {
  const matches = mention.match(/^<@&(\d+)>$/)

  if (!matches) {
    return null
  }

  return roles.cache.get(matches[1])
}
