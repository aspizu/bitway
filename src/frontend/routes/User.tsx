import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Image,
    Input,
    Link as LinkUI,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tab,
    Tabs,
    useDisclosure,
} from "@nextui-org/react"
import {formatDate, formatDistanceToNow} from "date-fns"
import toast from "react-hot-toast"
import {Link, useParams} from "react-router-dom"
import * as api from "~/api"
import {Blog} from "~/components/Blog"
import {NotFound} from "~/components/NotFound"
import {UserHandle} from "~/components/UserHandle"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {numberFormat} from "~/misc"
import {emailError, fieldError} from "~/models"
import {useSignalMethod} from "~/reproca"
import {session} from "~/session"
import {MutualFollowers} from "./MutualFollowers"

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
    const is_following = user.value.ok.followers.is_following
    return (
        <main className="main-page lg:flex-row gap-4 lg:items-start">
            <Card className="flex-shrink-0 lg:max-w-[25rem]">
                <CardBody className="items-center gap-4 pt-8 pb-5">
                    <div className="flex pl-4 pb-3 gap-8">
                        <Avatar
                            isBordered
                            size="lg"
                            className="scale-[2] m-6"
                            src={user.value.ok.avatar}
                        />
                        <div className="flex flex-col justify-center">
                            <LinkUI as="p" size="sm">
                                <Link to={`/user/${user.value.ok.username}`}>
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
                                    className="mt-1"
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
                    <p className="text-sm text-gray-400">
                        {numberFormat(
                            user.value.ok.followers.follower_count,
                            "follower"
                        )}{" "}
                        🞄 Joined{" "}
                        {formatDistanceToNow(user.value.ok.created_at * 1000)}{" "}
                        ago 🞄 Last seen{" "}
                        {formatDistanceToNow(user.value.ok.last_seen_at * 1000)}{" "}
                        ago
                    </p>
                    <MutualFollowers followers={user.value.ok.followers} />
                    <div className="flex">
                        {session.value &&
                            session.value.username !==
                                user.value.ok.username && (
                                <Button
                                    className="w-[15ch] lg:w-full"
                                    radius="full"
                                    color={is_following ? "default" : "primary"}
                                    onClick={async () => {
                                        if (is_following) {
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
                                    {is_following ? "Unfollow" : "Follow"}
                                </Button>
                            )}
                        {session.value?.username === user.value.ok.username && (
                            <Button size="sm" onClick={onOpen}>
                                <Icon>edit</Icon>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
            <div className="flex flex-col w-full">
                <Tabs
                    variant="underlined"
                    className="justify-center lg:justify-normal"
                >
                    <Tab key="blogs" title="Blogs">
                        <div className="flex flex-col gap-4">
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
                        </div>
                    </Tab>
                    <Tab key="startups" title="Startups">
                        <div className="flex flex-col gap-4">
                            {user.value.ok.startups.map((startup) => (
                                <UserStartup
                                    key={startup.id}
                                    avatar={user.value!.ok!.avatar}
                                    name={user.value!.ok!.name}
                                    username={user.value!.ok!.username}
                                    startup={startup}
                                />
                            ))}
                        </div>
                    </Tab>
                </Tabs>
            </div>
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

function UserStartup({
    avatar,
    name,
    username,
    startup,
}: {
    avatar: string
    name: string
    username: string

    startup: api.UserStartup
}) {
    return (
        <Card>
            <CardHeader className="flex-col items-start gap-4">
                <UserHandle avatar={avatar} name={name} username={username} />
                <p className="text-pretty">{startup.keynote}</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-2">
                <Image src={startup.banner} />
                <LinkUI as="p" size="lg">
                    <Link to={`/startup/${startup.id}`}>{startup.name}</Link>
                </LinkUI>
                <p className="text-sm text-gray-400">
                    {numberFormat(startup.follower_count, "follower")} 🞄 founded
                    on {formatDate(startup.founded_at * 1000, "yyyy-MM-dd")} 🞄
                    added {formatDistanceToNow(startup.created_at * 1000)} ago
                </p>
                <p className="text-pretty">{startup.description}</p>
            </CardBody>
        </Card>
    )
}
