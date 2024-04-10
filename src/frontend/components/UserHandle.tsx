import {Avatar, Link as LinkUI} from "@nextui-org/react"
import {Link} from "react-router-dom"
import {numberFormat} from "~/misc"

export function UserHandle({
    avatar,
    name,
    username,
    followerCount,
}: {
    avatar: string
    name: string
    username: string
    followerCount?: number
}) {
    return (
        <div className="flex gap-2 items-center flex-shrink-0">
            <Avatar src={avatar} />
            <div className="flex flex-col">
                <p className="flex items-center">
                    {name}
                    {!!followerCount && (
                        <span className="text-sm text-gray-400">
                            🞄{numberFormat(followerCount, "follower")}
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
