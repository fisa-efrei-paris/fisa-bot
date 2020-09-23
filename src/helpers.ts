import {
  Guild,
  GuildMember,
  GuildMemberResolvable,
  RoleManager
} from "discord.js"

export const getGuildMember = (
  guild: Guild | null | undefined,
  userId: GuildMemberResolvable | null | undefined
): GuildMember | null => {
  if (!guild || !userId) {
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

export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
