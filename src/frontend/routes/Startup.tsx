import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    useDisclosure,
} from "@nextui-org/react"
import {useSignal, useSignalEffect} from "@preact/signals-react"
import {formatDate, formatDistanceToNow} from "date-fns"
import toast from "react-hot-toast"
import {useParams} from "react-router-dom"
import * as api from "~/api"
import {UserHandle} from "~/components/UserHandle"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {DateToInteger, numberFormat} from "~/misc"
import {useSignalMethod, type MethodResponse} from "~/reproca"
import {session} from "~/session"
import {MutualFollowers} from "./MutualFollowers"

export function Startup() {
    const addFounderModal = useDisclosure()
    const editStartupModal = useDisclosure()
    const {startupId} = useParams()
    const [startup, fetchStartup] = useSignalMethod(
        () => api.get_startup(Number(startupId)),
        {
            clearWhileFetching: false,
        }
    )
    if (!startup.value?.ok) return null
    const startupData = startup.value.ok
    const sessionIsFounder = Boolean(
        session.value &&
            startupData.founders.find(
                (founder) => founder.id === session.value!.id
            )
    )
    return (
        <main className="main-page gap-4">
            <Card>
                <CardHeader className="flex-col items-stretch gap-4 pb-0">
                    <Image src={startupData.banner} />
                    <div className="flex items-center">
                        <div className="flex flex-col">
                            <p className="font-bold text-xl">
                                {startupData.name}
                            </p>
                            <p className="text-sm text-gray-400">
                                {numberFormat(
                                    startupData.followers.follower_count,
                                    "follower"
                                )}{" "}
                                🞄 since{" "}
                                {formatDate(
                                    startupData.founded_at * 1000,
                                    "yyyy-MM-dd"
                                )}{" "}
                                🞄 added{" "}
                                {formatDistanceToNow(
                                    startupData.created_at * 1000
                                )}{" "}
                                ago
                            </p>
                        </div>
                        <Button
                            className="ml-auto"
                            radius="full"
                            color={
                                startupData.followers.is_following
                                    ? "default"
                                    : "primary"
                            }
                            onClick={async () => {
                                if (startupData.followers.is_following) {
                                    await api.unfollow_startup(startupData.id)
                                    toast.success(
                                        `You are no longer following ${startupData.name}`
                                    )
                                } else {
                                    await api.follow_startup(startupData.id)
                                    toast.success(
                                        `You are now following ${startupData.name}`
                                    )
                                }
                                fetchStartup()
                            }}
                        >
                            {startupData.followers.is_following
                                ? "Unfollow"
                                : "Follow"}
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <MutualFollowers followers={startupData.followers} />
                    <p>{startupData.description}</p>
                    {sessionIsFounder && (
                        <Button
                            className="mt-2 mx-auto"
                            size="sm"
                            onClick={editStartupModal.onOpen}
                        >
                            <Icon>edit</Icon>
                            Edit startup
                        </Button>
                    )}
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
                    <Founder
                        key={founder.id}
                        sessionIsFounder={sessionIsFounder}
                        startup_id={startupData.id}
                        founder={founder}
                        fetchStartup={fetchStartup}
                    />
                ))}{" "}
                {sessionIsFounder && (
                    <Button
                        className="h-full min-h-[4rem]"
                        color="primary"
                        variant="bordered"
                        onClick={addFounderModal.onOpen}
                    >
                        <Icon size="lg">add</Icon>
                    </Button>
                )}
            </div>
            <Modal
                isOpen={addFounderModal.isOpen}
                onClose={addFounderModal.onClose}
            >
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
            <Modal
                isOpen={editStartupModal.isOpen}
                onClose={editStartupModal.onClose}
            >
                <ModalContent>
                    {(onClose) => (
                        <EditStartupModal
                            startup={startupData}
                            onClose={onClose}
                            fetchStartup={fetchStartup}
                        />
                    )}
                </ModalContent>
            </Modal>
        </main>
    )
}

function Founder({
    sessionIsFounder,
    startup_id,
    founder,
    fetchStartup,
}: {
    sessionIsFounder: boolean
    startup_id: number
    founder: api.Founder
    fetchStartup: () => void
}) {
    const editFounderModal = useDisclosure()
    const deleteFounderModal = useDisclosure()
    return (
        <Card>
            <CardBody>
                <UserHandle
                    avatar={founder.avatar}
                    name={founder.name}
                    username={founder.username}
                    followerCount={founder.follower_count}
                />
                {founder.keynote && (
                    <p className="text-pretty pt-2 my-auto">
                        {founder.keynote}
                    </p>
                )}
            </CardBody>
            <Divider />
            <CardFooter>
                <p className="text-sm text-gray-500">
                    Joined as a founder on{" "}
                    {formatDate(founder.founded_at * 1000, "yyyy-MM-dd")}
                </p>
                {sessionIsFounder && (
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                className="ml-auto"
                                isIconOnly
                                radius="full"
                                size="sm"
                                variant="flat"
                                onClick={() => {
                                    console.log("remove founder")
                                }}
                            >
                                <Icon>more_vert</Icon>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Options">
                            <DropdownItem
                                key="edit"
                                onClick={editFounderModal.onOpen}
                            >
                                Edit
                            </DropdownItem>
                            <DropdownItem
                                key="edit"
                                className="text-danger"
                                color="danger"
                                onClick={deleteFounderModal.onOpen}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                )}
            </CardFooter>
            <Modal
                isOpen={editFounderModal.isOpen}
                onClose={editFounderModal.onClose}
            >
                <ModalContent>
                    {(onClose) => (
                        <EditFounderModal
                            startup_id={startup_id}
                            founder={founder}
                            onClose={onClose}
                            fetchStartup={fetchStartup}
                        />
                    )}
                </ModalContent>
            </Modal>
            <Modal
                isOpen={deleteFounderModal.isOpen}
                onClose={deleteFounderModal.onClose}
            >
                <ModalContent>
                    <ModalHeader>Delete founder</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete this founder?</p>
                        <UserHandle
                            {...founder}
                            followerCount={founder.follower_count}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            onClick={async () => {
                                await api.remove_founder(startup_id, founder.id)
                                deleteFounderModal.onClose()
                                fetchStartup()
                                toast.success("Founder deleted")
                            }}
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Card>
    )
}

function EditFounderModal({
    startup_id,
    founder,
    onClose,
    fetchStartup,
}: {
    startup_id: number
    founder: api.Founder
    onClose: () => void
    fetchStartup: () => void
}) {
    const keynote = useFormInput<HTMLTextAreaElement>({
        default: founder.keynote,
        allowEmpty: true,
        error: api.BIO.getErrorMsg,
    })
    const foundedAt = useSignal(new Date(founder.founded_at * 1000))
    async function onSave() {
        if (!keynote.validate({focus: true})) return
        await api.edit_founder(
            startup_id,
            founder.id,
            keynote.value.value,
            DateToInteger(foundedAt.value)
        )
        onClose()
        fetchStartup()
        toast.success("Founder updated")
    }
    return (
        <>
            <ModalHeader>Edit founder</ModalHeader>
            <ModalBody>
                <UserHandle
                    avatar={founder.avatar}
                    name={founder.name}
                    username={founder.username}
                    followerCount={founder.follower_count}
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
                <Textarea
                    {...keynote.inputProps}
                    variant="bordered"
                    label="Keynote"
                />
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={onSave}>
                    Save
                </Button>
            </ModalFooter>
        </>
    )
}

function EditStartupModal({
    startup,
    onClose,
    fetchStartup,
}: {
    startup: api.Startup
    onClose: () => void
    fetchStartup: () => void
}) {
    const name = useFormInput({
        default: startup.name,
        error: api.NAME.getErrorMsg,
        onEnter: () => description.ref.current?.focus(),
    })
    const description = useFormInput<HTMLTextAreaElement>({
        default: startup.description,
        allowEmpty: true,
        error: api.BIO.getErrorMsg,
        onEnter: () => banner.ref.current?.focus(),
    })
    const banner = useFormInput({
        default: startup.banner,
        allowEmpty: true,
        error: api.URL.getErrorMsg,
        onEnter: onSave,
    })
    const foundedAt = useSignal(new Date(startup.founded_at * 1000))
    async function onSave() {
        if (!name.validate({focus: true})) return
        if (!description.validate({focus: true})) return
        if (!banner.validate({focus: true})) return
        await api.update_startup(
            startup.id,
            name.value.value,
            description.value.value,
            banner.value.value,
            DateToInteger(foundedAt.value)
        )
        onClose()
        fetchStartup()
    }
    return (
        <>
            <ModalHeader>Edit startup</ModalHeader>
            <ModalBody>
                <Input label="Name" {...name.inputProps} />
                <Textarea label="Description" {...description.inputProps} />
                <Input label="Banner" {...banner.inputProps} />
                <Input
                    label="Founded on"
                    type="date"
                    value={foundedAt.value.toISOString().split("T")[0]}
                    onChange={(ev) => {
                        foundedAt.value = ev.target.valueAsDate!
                    }}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={onSave}>
                    Save
                </Button>
            </ModalFooter>
        </>
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
        (): Promise<MethodResponse<api.UserHandle | null>> =>
            api.find_user(username.value.peek())
    )
    const username = useFormInput({
        error: (value) => {
            if (user.value?.ok === null && username.value.value.trim() !== "")
                return "User not found"
            if (founderIds.includes(user.value?.ok?.id || -1))
                return "User is already a founder"
            return api.USERNAME.getErrorMsg(value)
        },
        allowEmpty: false,
        onDebounce: fetchUser,
    })
    const keynote = useFormInput<HTMLTextAreaElement>({
        allowEmpty: true,
        error: api.BIO.getErrorMsg,
    })
    useSignalEffect(() => {
        if (user.value) {
            username.validate({noCallback: true})
        }
    })
    const foundedAt = useSignal(new Date())
    async function onAddFounder() {
        if (!username.validate({focus: true, noCallback: true})) return
        if (!keynote.validate({focus: true})) return
        if (!user.value?.ok) return
        await api.add_founder(
            startupId,
            user.value.ok.id,
            keynote.value.value,
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
                        followerCount={user.value.ok.follower_count}
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
                <Textarea
                    {...keynote.inputProps}
                    variant="bordered"
                    label="Keynote"
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
