import {Avatar, Button, Card, CardBody} from "@nextui-org/react"
import {useParams} from "react-router-dom"
import * as api from "~/api"
import {useSignalMethod} from "~/reproca"
import {session} from "~/session"

export function User() {
    const {username} = useParams()
    const [user, fetchUser] = useSignalMethod(() => api.get_user(username!))
    if (!user.value?.ok) return null
    const isFollowing =
        session.value &&
        user.value.ok.followers.find(
            (follower) => follower.id === session.value!.id
        )
    return (
        <main className="flex flex-col p-4 mx-auto max-w-[1024px]">
            <Card>
                <CardBody className="flex-row justify-evenly items-center p-8">
                    <div className="flex gap-6">
                        <div className="relative flex items-end justify-center">
                            <Avatar size="lg" className="scale-[2] m-6" />
                            {session.value && (
                                <Button
                                    className="absolute bottom-[-1rem]"
                                    radius="full"
                                    size="sm"
                                    color={isFollowing ? "warning" : "primary"}
                                    variant="shadow"
                                    onClick={async () => {
                                        if (isFollowing) {
                                            await api.unfollow_user(
                                                user.value?.ok?.id!
                                            )
                                        } else {
                                            await api.follow_user(
                                                user.value?.ok?.id!
                                            )
                                        }
                                        fetchUser()
                                    }}
                                >
                                    {isFollowing ? "Unfollow" : "Follow"}
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm text-primary font-bold">
                                @{user.value.ok.username}
                            </p>

                            <p className="font-bold text-2xl">
                                {user.value.ok.name}
                            </p>

                            <p className="text-gray-500 text-sm">
                                {user.value.ok.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-4xl">
                            {user.value.ok.followers.length}
                        </p>
                        <p className="text-sm">Followers</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-4xl">
                            {user.value.ok.following.length}
                        </p>
                        <p className="text-sm">Following</p>
                    </div>
                </CardBody>
            </Card>
        </main>
    )
}
