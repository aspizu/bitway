import {Link as LinkUI} from "@nextui-org/react"
import {Link} from "react-router-dom"
import * as api from "~/api"

export function MutualFollowers({followers}: {followers: api.Followers}) {
    if (followers.mutuals.length === 0) return null
    return (
        <p className="text-sm text-gray-400">
            Followed by{" "}
            {followers.mutuals.map((mutual, i) => (
                <>
                    {i === followers.mutuals.length - 1
                        ? " and "
                        : i !== 0 && ", "}
                    <LinkUI as="span" size="sm">
                        <Link to={`/user/${mutual.username}`}>
                            @{mutual.username}
                        </Link>
                    </LinkUI>
                </>
            ))}
        </p>
    )
}
