import {Avatar, Link as LinkUI} from "@nextui-org/react"
import {Link} from "react-router-dom"
import {s} from "~/misc"

export function UserHandle({
    avatar,
    name,
    username,
    followerCount,
    followingCount,
}: {
    avatar: string
    name: string
    username: string
    followerCount?: number
    followingCount?: number
}) {
    return (
        <div className="flex gap-2 items-center">
            <Avatar src={avatar} />
            <div className="flex flex-col">
                <p className="flex items-center">
                    {name}
                    {!!followerCount && (
                        <span className="text-sm text-gray-400">
                            🞄{followerCount} follower{s(followerCount)}
                        </span>
                    )}
                    {!!followingCount && (
                        <span className="text-sm text-gray-400">
                            🞄{followingCount} following
                        </span>
                    )}
                </p>
                <LinkUI as="p" size="sm">
                    <Link to={`/user/${username}`}>@{username}</Link>
                </LinkUI>
            </div>
        </div>
    )
}
