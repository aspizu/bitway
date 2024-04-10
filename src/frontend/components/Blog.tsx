import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react"
import {formatDistanceToNow} from "date-fns"
import toast from "react-hot-toast"
import * as api from "~/api"
import {Icon} from "~/icons"
import {numberFormat, readTime} from "~/misc"
import {session} from "~/session"
import {UserHandle} from "./UserHandle"

export function Blog({
    userId,
    avatar,
    username,
    name,
    followerCount,
    blogId,
    title,
    content,
    createdAt,
    poll,
    onDelete,
}: {
    userId: number
    avatar: string
    username: string
    name: string
    followerCount?: number
    blogId: number
    title: string
    content: string
    createdAt: number
    poll?: api.Poll
    onDelete?: () => void
}) {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const totalVotes = poll?.options.reduce(
        (acc, option) => acc + option.votes,
        0
    )
    return (
        <Card>
            <CardHeader className="gap-4">
                <UserHandle
                    avatar={avatar}
                    username={username}
                    name={name}
                    followerCount={followerCount}
                />
                <div className="flex flex-col ml-auto text-sm text-gray-400">
                    <p>{formatDistanceToNow(createdAt * 1000)} ago</p>
                    {((readTimeText) => readTimeText && <p>{readTimeText}</p>)(
                        readTime(content)
                    )}
                </div>
                {session.value?.id === userId && (
                    <Button
                        isIconOnly
                        color="danger"
                        radius="full"
                        variant="flat"
                        size="sm"
                        onClick={onOpen}
                    >
                        <Icon>delete</Icon>
                    </Button>
                )}
            </CardHeader>
            <Divider />
            <CardBody className="max-h-[20rem]">
                <p className="font-bold text-lg">{title}</p>
                {content}
            </CardBody>
            {poll && (
                <>
                    <Divider />
                    <CardBody className="gap-4">
                        {poll.options.map((option) => (
                            <PollOption
                                key={option.id}
                                option={option.option}
                                votes={option.votes}
                                totalVotes={totalVotes!}
                                isVoted={option.id === poll.my_vote_id}
                                onClick={async () => {
                                    if (!session.value) {
                                        toast.error("You are not logged in.")
                                        return
                                    }
                                    await api.vote_poll(blogId, option.id)
                                    toast.success("Voted!")
                                    onDelete?.()
                                }}
                            />
                        ))}
                        <p className="text-sm text-gray-400">
                            {numberFormat(totalVotes!, "vote")}
                        </p>
                    </CardBody>
                </>
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                Are you sure you want to delete this blog?
                            </ModalHeader>
                            <ModalBody>
                                <p className="font-bold text-lg">{title}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    onClick={async () => {
                                        await api.delete_blog(blogId)
                                        toast.success("Blog was deleted.")
                                        onClose()
                                        onDelete?.()
                                    }}
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </Card>
    )
}

function PollOption({
    option,
    votes,
    totalVotes,
    isVoted,
    onClick,
}: {
    option: string
    votes: number
    totalVotes: number
    isVoted: boolean
    onClick?: () => void
}) {
    if (totalVotes === 0) {
        totalVotes = 1
    }
    const percent = Math.floor((votes / totalVotes) * 1000) / 10
    return (
        <div
            className={`
                group hover:cursor-pointer relative items-center flex border-1
                rounded-small overflow-hidden
                ${
                    isVoted
                        ? "border-primary text-white"
                        : "border-content3 hover:border-content4 text-foreground-400 hover:text-foreground"
                }`}
            onClick={onClick}
        >
            <div
                className={`
                    left-0 top-0 h-[2rem]
                    ${
                        isVoted
                            ? "bg-primary"
                            : "bg-content2 group-hover:bg-content3"
                    }
                    `}
                style={{
                    width: `${percent}%`,
                }}
            />

            <p className="absolute pl-3 truncate w-[99] flex items-center gap-1">
                {isVoted && <Icon className="">check</Icon>}
                {option}
            </p>
            <p className="absolute right-3 text-sm">{percent}%</p>
        </div>
    )
}
