import { getAdminRoleId } from "../../consts"
import { GuildMember, Message } from "discord.js"
import { loadConfiguration } from "../index"
import { Octokit } from "@octokit/rest"
import { createAppAuth } from "@octokit/auth"
import { ActionCallback } from "../../command"

const config = loadConfiguration("github")

const github = new Octokit({
  authStrategy: createAppAuth,
  auth: config.github
})

const inviteUser = async (username: string, team: string) => {
  return github.teams.addOrUpdateMembershipForUserInOrg({
    org: config.org,
    username,
    team_slug: team
  })
}

const invite: ActionCallback = async (
  caller: GuildMember,
  message: Message,
  args: string[]
) => {
  if (!config.channels.includes(message.channel.id)) {
    return
  }

  if (!caller.roles.cache.has(getAdminRoleId())) {
    await message.react("❌")
    return
  }

  if (args.length < 2) {
    await message.react("❌")
    return
  }

  try {
    const { data: teams } = await github.teams.list({
      org: config.org
    })

    if (!teams.map(team => team.name).includes(args[1])) {
      await message.react("❌")
      return
    }

    await message.react("🔁")
    await inviteUser(args[0], args[1])
    console.log(
      `github: ${caller.user.tag} invited https://github.com/${args[0]} (${args[1]})`
    )

    await message.react("✅")
  } catch (e) {
    await message.react("❌")
  } finally {
    await message.reactions.cache.get("🔁")?.remove()
  }
}

export default invite
