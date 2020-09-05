import { GuildMember, Message } from "discord.js"

export type ActionCallback = {
  (caller: GuildMember, message: Message, args: string[]): Promise<void> | void
}
