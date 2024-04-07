import {
    Avatar,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Link as LinkUI,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react"
import {formatDistance} from "date-fns/fp"
import toast from "react-hot-toast"
import {Link, useParams} from "react-router-dom"
import * as api from "~/api"
import {Blog} from "~/components/Blog"
import {NotFound} from "~/components/NotFound"
import {UserHandle} from "~/components/UserHandle"
import {useFormInput} from "~/hooks/form"
import {emailError, fieldError} from "~/models"
import {useSignalMethod} from "~/reproca"
import {session} from "~/session"

function EditProfile({
    onClose,
    fetchUser,
}: {
    onClose: () => void
    fetchUser: () => void
}) {
    const avatar = useFormInput({
        onEnter: () => name.ref.current?.focus(),
        error: fieldError,
        default: session.value?.avatar,
        allowEmpty: true,
    })
    const name = useFormInput({
        onEnter: () => email.ref.current?.focus(),
        error: fieldError,
        default: session.value?.name,
    })
    const email = useFormInput({
        onEnter: () => link.ref.current?.focus(),
        error: emailError,
        default: session.value?.email,
    })
    const link = useFormInput({
        onEnter: () => bio.ref.current?.focus(),
        error: fieldError,
        default: session.value?.link,
        allowEmpty: true,
    })
    const bio = useFormInput({
        error: fieldError,
        default: session.value?.bio,
        allowEmpty: true,
    })
    if (!session.value) return null
    return (
        <>
            <ModalHeader>Edit your profile</ModalHeader>
            <ModalBody>
                <Input label="Avatar URL" {...avatar.inputProps} />
                <Input label="Name" {...name.inputProps} />
                <Input label="Email" {...email.inputProps} />
                <Input label="Link" {...link.inputProps} />
                <Input label="Bio" {...bio.inputProps} />
            </ModalBody>
            <ModalFooter>
                <Button
                    color="success"
                    onClick={async () => {
                        if (!avatar.validate({focus: true})) return
                        if (!name.validate({focus: true})) return
                        if (!email.validate({focus: true})) return
                        if (!link.validate({focus: true})) return
                        if (!bio.validate({focus: true})) return
                        await api.update_user(
                            avatar.value.value,
                            link.value.value,
                            email.value.value,
                            name.value.value,
                            bio.value.value
                        )
                        session.value = {
                            ...session.value!,
                            avatar: avatar.value.value,
                            link: link.value.value,
                            email: email.value.value,
                            name: name.value.value,
                            bio: bio.value.value,
                        }
                        toast.success("Profile updated.")
                        fetchUser()
                        onClose()
                    }}
                >
                    Save
                </Button>
            </ModalFooter>
        </>
    )
}

export function User() {
    const {username} = useParams()
    const [user, fetchUser] = useSignalMethod(() => api.get_user(username!), {
        clearWhileFetching: false,
    })
    const {isOpen, onOpen, onClose} = useDisclosure()
    if (user.value?.ok?.username !== username) {
        fetchUser()
    }
    if (user.value !== undefined && user.value.ok === null)
        return (
            <main className="main-page">
                <NotFound message="User not found" />
            </main>
        )
    if (!user.value?.ok) return null
    const isFollowing =
        session.value &&
        user.value.ok.followers.find(
            (follower) => follower.id === session.value!.id
        )
    return (
        <main className="main-page gap-4">
            <Card>
                <CardBody className="md:flex-row items-center justify-evenly md:items-start p-8 gap-4">
                    <div className="flex flex-col gap-6 items-center md:max-w-[40%]">
                        <div className="flex gap-8">
                            <Avatar
                                isBordered
                                size="lg"
                                className="scale-[2] m-6"
                                src={user.value.ok.avatar}
                            />
                            <div className="flex flex-col justify-center">
                                <LinkUI as="p" size="sm">
                                    <Link
                                        to={`/user/${user.value.ok.username}`}
                                    >
                                        @{user.value.ok.username}
                                    </Link>
                                </LinkUI>
                                <p className="font-bold text-2xl">
                                    {user.value.ok.name}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {user.value.ok.email}
                                </p>
                                {user.value.ok.link && (
                                    <Chip
                                        size="sm"
                                        as={LinkUI}
                                        href={user.value.ok.link}
                                        className="mt-2"
                                    >
                                        <span className="flex max-w-[10rem] truncate">
                                            {user.value.ok.link}
                                        </span>
                                    </Chip>
                                )}
                            </div>
                        </div>
                        {user.value.ok.bio && (
                            <p className="text-pretty">{user.value.ok.bio}</p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-400 text-center">
                            <p>
                                Joined{" "}
                                {formatDistance(
                                    new Date(),
                                    new Date(user.value.ok.created_at * 1000)
                                )}{" "}
                                ago
                            </p>
                            <p>
                                Last seen{" "}
                                {formatDistance(
                                    new Date(),
                                    new Date(user.value.ok.last_seen_at * 1000)
                                )}{" "}
                                ago
                            </p>
                        </div>
                        <div className="flex justify-stretch gap-3">
                            {session.value && (
                                <Button
                                    color={isFollowing ? "default" : "primary"}
                                    onClick={async () => {
                                        if (isFollowing) {
                                            await api.unfollow_user(
                                                user.value?.ok?.id!
                                            )
                                            toast.success(
                                                `You are no longer following ${user.value?.ok?.name}.`
                                            )
                                        } else {
                                            await api.follow_user(
                                                user.value?.ok?.id!
                                            )
                                            toast.success(
                                                `You are now following ${user.value?.ok?.name}.`
                                            )
                                        }
                                        fetchUser()
                                    }}
                                >
                                    {isFollowing ? "Unfollow" : "Follow"}
                                </Button>
                            )}
                            {session.value?.username ===
                                user.value.ok.username && (
                                <Button onClick={onOpen}>Edit Profile</Button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-bold">
                            Followers ({user.value.ok.followers.length})
                        </p>
                        {user.value.ok.followers.map((follower) => (
                            <UserHandle key={follower.id} {...follower} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-bold">
                            Following ({user.value.ok.following.length})
                        </p>
                        {user.value.ok.following.map((follower) => (
                            <UserHandle key={follower.id} {...follower} />
                        ))}
                    </div>
                </CardBody>
            </Card>
            {user.value.ok.blogs.map((blog) => {
                const author = user.value?.ok!
                return (
                    <Blog
                        key={blog.id}
                        userId={author.id}
                        avatar={author.avatar}
                        username={author.username}
                        name={author.name}
                        blogId={blog.id}
                        title={blog.title}
                        content={blog.content}
                        createdAt={blog.created_at}
                        poll={blog.poll ?? undefined}
                        onDelete={fetchUser}
                    />
                )
            })}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <EditProfile onClose={onClose} fetchUser={fetchUser} />
                    )}
                </ModalContent>
            </Modal>
        </main>
    )
}
