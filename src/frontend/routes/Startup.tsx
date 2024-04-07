import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react"
import {useSignal, useSignalEffect} from "@preact/signals-react"
import {formatDate, formatDistanceToNow} from "date-fns"
import {useParams} from "react-router-dom"
import * as api from "~/api"
import {UserHandle} from "~/components/UserHandle"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {DateToInteger} from "~/misc"
import {usernameError} from "~/models"
import {useSignalMethod, type MethodResponse} from "~/reproca"
import {session} from "~/session"

export function Startup() {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const {startupId} = useParams()
    const [startup, fetchStartup] = useSignalMethod(
        () => api.get_startup(Number(startupId)),
        {
            clearWhileFetching: false,
        }
    )
    if (!startup.value?.ok) return null
    const startupData = startup.value.ok
    return (
        <main className="main-page gap-4">
            <Card>
                <CardHeader className="p-1">
                    <Image src={startupData.banner} />
                </CardHeader>
                <CardBody>
                    <p className="font-bold text-xl">{startupData.name}</p>
                    <p className="text-sm text-gray-500">
                        since{" "}
                        {formatDate(
                            startupData.founded_at * 1000,
                            "yyyy-mm-dd"
                        )}
                        🞄added{" "}
                        {formatDistanceToNow(startupData.created_at * 1000)} ago
                    </p>
                    <p>{startupData.description}</p>
                </CardBody>
            </Card>
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(15rem, 1fr))",
                }}
            >
                {startupData.founders.map((founder) => (
                    <Card>
                        <CardBody>
                            <UserHandle
                                avatar={founder.avatar}
                                name={founder.name}
                                username={founder.username}
                                followerCount={founder.follower_count}
                            />
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            <p className="text-sm text-gray-500">
                                Joined as a founder on{" "}
                                {formatDate(
                                    founder.founded_at * 1000,
                                    "yyyy-mm-dd"
                                )}
                            </p>
                        </CardFooter>
                    </Card>
                ))}{" "}
                {session.value &&
                    startupData.founders.find(
                        (founder) => founder.id === session.value!.id
                    ) && (
                        <Button
                            className="h-full min-h-[4rem]"
                            color="primary"
                            variant="bordered"
                            onClick={onOpen}
                        >
                            <Icon size="lg">add</Icon>
                        </Button>
                    )}
            </div>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <AddFounderModal
                            startupId={Number(startupId)}
                            founderIds={startupData.founders.map(
                                (founder) => founder.id
                            )}
                            onClose={onClose}
                            fetchStartup={fetchStartup}
                        />
                    )}
                </ModalContent>
            </Modal>
        </main>
    )
}

function AddFounderModal({
    startupId,
    onClose,
    founderIds,
    fetchStartup,
}: {
    startupId: number
    founderIds: number[]
    onClose: () => void
    fetchStartup: () => void
}) {
    const [user, fetchUser] = useSignalMethod(
        (): Promise<MethodResponse<api.FoundUser | null>> =>
            api.find_user(username.value.peek())
    )
    const username = useFormInput({
        error: (value) => {
            if (user.value?.ok === null && username.value.value.trim() !== "")
                return "User not found"
            if (founderIds.includes(user.value?.ok?.id || -1))
                return "User is already a founder"
            return usernameError(value)
        },
        allowEmpty: false,
        onDebounce: fetchUser,
    })
    useSignalEffect(() => {
        if (user.value) {
            username.validate({noCallback: true})
        }
    })
    const foundedAt = useSignal(new Date())
    async function onAddFounder() {
        if (!username.validate({focus: true, noCallback: true})) return
        if (!user.value?.ok) return
        await api.add_founder(
            startupId,
            user.value.ok.id,
            DateToInteger(foundedAt.value)
        )
        onClose()
        fetchStartup()
    }
    return (
        <>
            <ModalHeader>Add founder</ModalHeader>
            <ModalBody>
                {user.value?.ok && (
                    <UserHandle
                        username={username.value.value}
                        avatar={user.value.ok.avatar}
                        name={user.value.ok.name}
                    />
                )}
                <Input
                    label="Username"
                    startContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                                @
                            </span>
                        </div>
                    }
                    {...username.inputProps}
                />
                <Input
                    label="Founded on"
                    size="sm"
                    type="date"
                    value={foundedAt.value.toISOString().split("T")[0]}
                    onChange={(ev) => {
                        foundedAt.value = ev.target.valueAsDate!
                    }}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={onAddFounder}>
                    Add
                </Button>
            </ModalFooter>
        </>
    )
}
