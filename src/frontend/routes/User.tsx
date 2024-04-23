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
    Spinner,
    Tab,
    Tabs,
    Textarea,
    useDisclosure
} from "@nextui-org/react"
import {batch} from "@preact/signals-react"
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
import {QueryType, useMutation, useQuery} from "~/query"
import {session} from "~/session"
import {MutualFollowers} from "./MutualFollowers"

function EditProfile({
    onClose,
    user,
    updateUser
}: {
    onClose: () => void
    user: api.User
    updateUser: typeof api.update_user
}) {
    const avatar = useFormInput({
        onEnter: () => name.ref.current?.focus(),
        error: api.URL.getErrorMsg,
        default: user.avatar,
        allowEmpty: true
    })
    const name = useFormInput({
        onEnter: () => email.ref.current?.focus(),
        error: api.NAME.getErrorMsg,
        default: user.name
    })
    const email = useFormInput({
        onEnter: () => link.ref.current?.focus(),
        error: api.EMAIL.getErrorMsg,
        default: user.email
    })
    const link = useFormInput({
        onEnter: () => bio.ref.current?.focus(),
        error: api.URL.getErrorMsg,
        default: user.link,
        allowEmpty: true
    })
    const bio = useFormInput<HTMLTextAreaElement>({
        error: api.BIO.getErrorMsg,
        default: user.bio,
        allowEmpty: true
    })
    return (
        <>
            <ModalHeader>Edit your profile</ModalHeader>
            <ModalBody>
                <Input label="Avatar URL" {...avatar.inputProps} />
                <Input label="Name" {...name.inputProps} />
                <Input label="Email" {...email.inputProps} />
                <Input label="Link" {...link.inputProps} />
                <Textarea label="Bio" {...bio.inputProps} />
            </ModalBody>
            <ModalFooter>
                <Button
                    color="success"
                    onClick={() => {
                        batch(async () => {
                            if (!avatar.validate({focus: true})) return
                            if (!name.validate({focus: true})) return
                            if (!email.validate({focus: true})) return
                            if (!link.validate({focus: true})) return
                            if (!bio.validate({focus: true})) return
                            await updateUser({
                                avatar: avatar.value.value,
                                link: link.value.value,
                                email: email.value.value,
                                name: name.value.value,
                                bio: bio.value.value
                            })
                            session.value = {
                                ...session.value!,
                                avatar: avatar.value.value,
                                link: link.value.value,
                                email: email.value.value,
                                name: name.value.value,
                                bio: bio.value.value
                            }
                            toast.success("Profile updated.")
                            onClose()
                        })
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
    const [user, fetchUser] = useQuery(() => api.get_user({username: username!}))

    if (user.type === QueryType.OK && user.value?.username !== username) {
        fetchUser()
    }

    const followUser = useMutation(user, fetchUser, api.follow_user, {
        update: (signal, {}) => {
            if (!signal) throw new Error("User not found")
            signal.followers.follower_count += 1
            signal.followers.is_following = true
        }
    })

    const unfollowUser = useMutation(user, fetchUser, api.unfollow_user, {
        update: (signal, {}) => {
            if (!signal) throw new Error("User not found")
            signal.followers.follower_count -= 1
            signal.followers.is_following = false
        }
    })

    const updateUser = useMutation(user, fetchUser, api.update_user, {
        update: (signal, {avatar, name, email, link, bio}) => {
            if (!signal) throw new Error("User not found")
            signal.avatar = avatar
            signal.name = name
            signal.email = email
            signal.link = link
            signal.bio = bio
        }
    })

    const deleteBlog = useMutation(user, fetchUser, api.delete_blog, {
        update: (signal, {blog_id}) => {
            if (!signal) throw new Error("User not found")
            const index = signal.blogs.findIndex((blog) => blog.id === blog_id)
            if (index === -1) throw new Error("Blog not found")
            signal.blogs.splice(index, 1)
        }
    })

    const votePoll = useMutation(user, fetchUser, api.vote_poll, {
        update: (signal, {blog_id, option_id}) => {
            if (!signal) throw new Error("User not found")
            const blog = signal.blogs.find((blog) => blog.id === blog_id)
            if (!blog) throw new Error("Blog not found")
            if (!blog.poll) throw new Error("Blog has no poll")
            const poll = blog.poll
            if (poll.my_vote_id !== null) {
                const votedOption = poll.options.find(
                    (option) => option.id === poll.my_vote_id
                )
                if (!votedOption) throw new Error("Voted option not found")
                votedOption.votes -= 1
            }
            const option = poll.options.find((option) => option.id === option_id)
            if (!option) throw new Error("Option not found")
            option.votes += 1
            poll.my_vote_id = option_id
        }
    })

    return (
        <main className="main-page">
            {user.type === QueryType.LOADING ?
                <Spinner />
            : user.value ?
                <UserContent
                    user={user.value}
                    followUser={followUser}
                    unfollowUser={unfollowUser}
                    updateUser={updateUser}
                    deleteBlog={deleteBlog}
                    votePoll={votePoll}
                />
            :   <NotFound message="User not found" />}
        </main>
    )
}

function UserContent({
    user,
    followUser,
    unfollowUser,
    updateUser,
    deleteBlog,
    votePoll
}: {
    user: api.User
    followUser: typeof api.follow_user
    unfollowUser: typeof api.unfollow_user
    updateUser: typeof api.update_user
    deleteBlog: typeof api.delete_blog
    votePoll: typeof api.vote_poll
}) {
    const {isOpen, onOpen, onClose} = useDisclosure()
    return (
        <main className="main-page lg:flex-row gap-4 w-full lg:items-start">
            <Card className="flex-shrink-0 lg:max-w-[25rem]">
                <CardBody className="items-center gap-4 pt-8 pb-5">
                    <div className="flex pl-4 pb-3 gap-8">
                        <Avatar
                            isBordered
                            size="lg"
                            className="scale-[2] m-6"
                            src={user.avatar}
                        />
                        <div className="flex flex-col justify-center">
                            <LinkUI as="p" size="sm">
                                <Link to={`/user/${user.username}`}>
                                    @{user.username}
                                </Link>
                            </LinkUI>
                            <p className="font-bold text-2xl">{user.name}</p>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            {user.link && (
                                <Chip
                                    size="sm"
                                    as={LinkUI}
                                    href={user.link}
                                    className="mt-1"
                                >
                                    <span className="flex max-w-[10rem] truncate">
                                        {user.link}
                                    </span>
                                </Chip>
                            )}
                        </div>
                    </div>
                    {user.bio && <p className="text-pretty">{user.bio}</p>}
                    <p className="text-sm text-gray-400">
                        {numberFormat(user.followers.follower_count, "follower")} 🞄
                        Joined {formatDistanceToNow(user.created_at * 1000)} ago 🞄 Last
                        seen {formatDistanceToNow(user.last_seen_at * 1000)} ago
                    </p>
                    <MutualFollowers followers={user.followers} />
                    <div className="flex">
                        {session.value && session.value.username !== user.username && (
                            <Button
                                className="w-[15ch] lg:w-full"
                                radius="full"
                                color={
                                    user.followers.is_following ? "default" : "primary"
                                }
                                onClick={async () => {
                                    if (user.followers.is_following) {
                                        await unfollowUser({user_id: user.id})
                                        toast.success(
                                            `You are no longer following ${user.name}.`
                                        )
                                    } else {
                                        await followUser({user_id: user.id})
                                        toast.success(
                                            `You are now following ${user.name}.`
                                        )
                                    }
                                }}
                            >
                                {user.followers.is_following ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                        {session.value?.username === user.username && (
                            <Button size="sm" onClick={onOpen}>
                                <Icon>edit</Icon>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
            <div className="flex flex-col w-full grow">
                <Tabs variant="underlined" className="justify-center lg:justify-normal">
                    <Tab key="blogs" title="Blogs">
                        <div className="flex flex-col gap-4">
                            {user.blogs.map((blog) => {
                                return (
                                    <Blog
                                        key={blog.id}
                                        userId={user.id}
                                        avatar={user.avatar}
                                        username={user.username}
                                        name={user.name}
                                        blogId={blog.id}
                                        title={blog.title}
                                        content={blog.content}
                                        createdAt={blog.created_at}
                                        poll={blog.poll ?? undefined}
                                        deleteBlog={deleteBlog}
                                        votePoll={votePoll}
                                    />
                                )
                            })}
                        </div>
                    </Tab>
                    <Tab key="startups" title="Startups">
                        <div className="flex flex-col gap-4">
                            {user.startups.map((startup) => (
                                <UserStartup
                                    key={startup.id}
                                    avatar={user.avatar}
                                    name={user.name}
                                    username={user.username}
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
                        <EditProfile
                            onClose={onClose}
                            user={user}
                            updateUser={updateUser}
                        />
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
    startup
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
                    {numberFormat(startup.follower_count, "follower")} 🞄 founded on{" "}
                    {formatDate(startup.founded_at * 1000, "yyyy-MM-dd")} 🞄 added{" "}
                    {formatDistanceToNow(startup.created_at * 1000)} ago
                </p>
                <p className="text-pretty">{startup.description}</p>
            </CardBody>
        </Card>
    )
}
