import {
  CategoryChannel,
  GuildMember,
  Message,
  MessageEmbed,
  OverwriteData,
  TextChannel
} from "discord.js"
import { ActionCallback } from "../../command"
import {
  getGuildMember,
  getRoleFromMention,
  shuffle,
  toKebabCase
} from "../../helpers"
import { loadConfiguration } from "../index"
import { choose } from "moniker"

const config = loadConfiguration("groups")

type Group = {
  name: string
  messageEmbed: Message | null
  category: CategoryChannel | null
  channel: TextChannel | null
  teacher: GuildMember | null
  members: GuildMember[]
}

const groupByN = <T>(data: T[], n: number): T[][] => {
  const result = []
  for (let i = 0; i < data.length; i += n) {
    result.push(data.slice(i, i + n))
  }
  return result
}

const setTeacher = async (message: Message, teacher: GuildMember) => {
  message.embeds[0].fields = [
    {
      name: "🎓",
      value: `${teacher}`,
      inline: true
    },
    ...message.embeds[0].fields
  ]
  await message.edit(message.embeds[0])
}

const generatedGroupEmbed = (group: Group) => {
  return new MessageEmbed({
    title: `Groupe ${group.name}`,
    color: Math.floor(Math.random() * 16777214) + 1,
    fields: [
      {
        name: `${group.members.length} 👥`,
        value: group.members.reduce((value, member) => {
          return !value ? `${member}` : `${value}\n${member}`
        }, ""),
        inline: true
      },
      {
        name: "💬",
        value: group.channel,
        inline: true
      }
    ]
  })
}

const addReactionListener = async (group: Group) => {
  if (!group.messageEmbed) {
    return
  }

  const collected = await group.messageEmbed.awaitReactions(
    (reaction, user) =>
      group.members.map(member => member.id).includes(user.id) &&
      reaction.emoji.name == "🎓",
    { max: 1, time: 30000 }
  )

  const teacher = getGuildMember(
    group.messageEmbed.guild,
    collected
      .first()
      ?.users.cache.find(user => user.id !== group.messageEmbed?.author.id)?.id
  )

  if (!teacher) {
    return
  }

  await setTeacher(group.messageEmbed, teacher)

  await group.channel?.send(
    group.members.reduce((value, member) => {
      return !value ? `${member}` : `${value}, ${member}`
    }, ""),
    {
      embed: new MessageEmbed({
        description: `${teacher} s'est proposé comme 🎓`
      })
    }
  )
}

export const createGroups: ActionCallback = async (
  caller: GuildMember,
  message: Message,
  args: string[]
) => {
  if (args.length < 2) {
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

  const personPerGroup = Number.parseInt(args[1])

  if (!personPerGroup) {
    await message.react("👎")
    return
  }

  const reactionEmoji = caller.guild.emojis.cache.find(
    emoji => emoji.name === "loading"
  )

  if (!reactionEmoji) {
    await message.react("👎")
    return
  }

  await message.react(reactionEmoji)

  const groups: Group[] = groupByN(
    shuffle(roleFromMention.members.array()),
    personPerGroup
  ).map(members => ({
    name: `${toKebabCase(roleFromMention.name)}-${choose()}`,
    messageEmbed: null,
    category: null,
    channel: null,
    teacher: null,
    members
  }))

  for (const group of groups) {
    const membersPermissions: OverwriteData[] = group.members.map(member => ({
      id: member.id,
      allow: ["VIEW_CHANNEL"]
    }))

    group.category = await caller.guild.channels.create(group.name, {
      type: "category",
      permissionOverwrites: [
        {
          id: caller.guild.roles.everyone,
          deny: ["VIEW_CHANNEL"]
        },
        ...membersPermissions
      ]
    })
    group.channel = await caller.guild.channels.create(group.name, {
      topic: "Groupe de révision temporaire",
      parent: group.category,
      type: "text"
    })
    await caller.guild.channels.create(group.name, {
      parent: group.category,
      type: "voice"
    })

    group.messageEmbed = await message.channel.send(generatedGroupEmbed(group))

    await group.messageEmbed.react("🎓")
  }

  await message.reactions.cache.get(reactionEmoji.id)?.remove()
  await message.react("👍")

  await Promise.all(groups.map(addReactionListener))
}

export const closeGroup: ActionCallback = async (
  caller: GuildMember,
  message: Message,
  args: string[]
) => {
  if (!caller.guild.roles.cache.find(role => !config.mods.includes(role.id))) {
    await message.react("👎")
    return
  }

  const reactionEmoji = caller.guild.emojis.cache.find(
    emoji => emoji.name === "loading"
  )

  if (!reactionEmoji) {
    await message.react("👎")
    return
  }

  const channel = message.channel

  if (!(channel instanceof TextChannel)) {
    await message.react("👎")
    return
  }

  if (channel.parent?.name !== channel.name) {
    await message.react("👎")
    return
  }

  const archive = message.guild?.channels.cache.find(
    channel => channel.id === config.archiveCategoryId
  )

  if (!archive || !(archive instanceof CategoryChannel)) {
    await message.react("👎")
    return
  }

  await message.react(reactionEmoji)

  await channel.parent.children
    .find(child => channel.name === child.name && child.type !== "text")
    ?.delete(`Group closed by ${caller}`)
  await channel.parent.delete(`Group closed by ${caller}`)

  await channel.edit({ parentID: archive.id }, `Group closed by ${caller}`)

  const permissions: OverwriteData[] = channel.permissionOverwrites
    .filter(permission => permission.id !== caller.guild.roles.everyone.id)
    .map(permission => ({
      id: permission.id,
      allow: ["VIEW_CHANNEL"],
      deny: ["SEND_MESSAGES", "ADD_REACTIONS"]
    }))
  await channel.overwritePermissions(
    [
      {
        id: caller.guild.roles.everyone,
        deny: ["VIEW_CHANNEL"]
      },
      ...permissions
    ],
    `Group closed by ${caller}`
  )

  await channel.send(
    new MessageEmbed({
      description: `${caller} a archivé ce salon !`
    })
  )

  await message.reactions.cache.get(reactionEmoji.id)?.remove()
  await message.react("👍")
}
