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
    Spinner,
    Textarea,
    useDisclosure
} from "@nextui-org/react"
import {useSignal, useSignalEffect} from "@preact/signals-react"
import {formatDate, formatDistanceToNow} from "date-fns"
import toast from "react-hot-toast"
import {useParams} from "react-router-dom"
import type {MethodResult} from "reproca/app"
import * as api from "~/api"
import {UserHandle} from "~/components/UserHandle"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {DateToInteger, numberFormat} from "~/misc"
import {QueryType, useMutation, useQuery} from "~/query"
import {session} from "~/session"
import {MutualFollowers} from "./MutualFollowers"

export function Startup() {
    const {startupId} = useParams()
    const [startup, fetchStartup] = useQuery(() =>
        api.get_startup({startup_id: Number(startupId)})
    )
    if (startup.type === QueryType.OK && startup.value?.id !== Number(startupId)) {
        fetchStartup()
    }
    const updateStartup = useMutation(startup, fetchStartup, api.update_startup, {
        update: (signal, {name, description, banner, founded_at}) => {
            if (!signal) throw new Error("Startup not found")
            signal.name = name
            signal.description = description
            signal.banner = banner
            signal.founded_at = founded_at
        }
    })
    const followStartup = useMutation(startup, fetchStartup, api.follow_startup, {
        update: (signal, {}) => {
            if (!signal) throw new Error("Startup not found")
            signal.followers.is_following = true
        }
    })
    const unfollowStartup = useMutation(startup, fetchStartup, api.unfollow_startup, {
        update: (signal, {}) => {
            if (!signal) throw new Error("Startup not found")
            signal.followers.is_following = false
        }
    })
    const editFounder = useMutation(startup, fetchStartup, api.edit_founder, {
        update: (signal, {founder_id, keynote, founded_at}) => {
            if (!signal) throw new Error("Startup not found")
            const founder = signal.founders.find((founder) => founder.id === founder_id)
            if (!founder) throw new Error("Founder not found")
            founder.keynote = keynote
            founder.founded_at = founded_at
        }
    })
    const removeFounder = useMutation(startup, fetchStartup, api.remove_founder, {
        update: (signal, {founder_id}) => {
            if (!signal) throw new Error("Startup not found")
            const index = signal.founders.findIndex(
                (founder) => founder.id === founder_id
            )
            if (index === -1) throw new Error("Founder not found")
            signal.founders.splice(index, 1)
        }
    })
    const addFounder = useMutation(startup, fetchStartup, api.add_founder)
    return (
        <main className="main-page gap-4">
            {startup.type === QueryType.LOADING ?
                <Spinner />
            : startup.value ?
                <StartupContent
                    startup={startup.value}
                    updateStartup={updateStartup}
                    followStartup={followStartup}
                    unfollowStartup={unfollowStartup}
                    editFounder={editFounder}
                    removeFounder={removeFounder}
                    addFounder={addFounder}
                />
            :   <p>Startup not found</p>}
        </main>
    )
}

function StartupContent({
    startup,
    updateStartup,
    followStartup,
    unfollowStartup,
    editFounder,
    removeFounder,
    addFounder
}: {
    startup: api.Startup
    updateStartup: typeof api.update_startup
    followStartup: typeof api.follow_startup
    unfollowStartup: typeof api.unfollow_startup
    editFounder: typeof api.edit_founder
    removeFounder: typeof api.remove_founder
    addFounder: typeof api.add_founder
}) {
    const addFounderModal = useDisclosure()
    const editStartupModal = useDisclosure()
    const sessionIsFounder = startup.founders.some(
        (founder) => founder.id === session.value?.id
    )
    return (
        <>
            <Card>
                <CardHeader className="flex-col items-stretch gap-4 pb-0">
                    <Image src={startup.banner} />
                    <div className="flex items-center">
                        <div className="flex flex-col">
                            <p className="font-bold text-xl">{startup.name}</p>
                            <p className="text-sm text-gray-400">
                                {numberFormat(
                                    startup.followers.follower_count,
                                    "follower"
                                )}{" "}
                                🞄 since{" "}
                                {formatDate(startup.founded_at * 1000, "yyyy-MM-dd")} 🞄
                                added {formatDistanceToNow(startup.created_at * 1000)}{" "}
                                ago
                            </p>
                        </div>
                        {session.value && (
                            <Button
                                className="ml-auto"
                                radius="full"
                                color={
                                    startup.followers.is_following ?
                                        "default"
                                    :   "primary"
                                }
                                onClick={async () => {
                                    if (startup.followers.is_following) {
                                        await unfollowStartup({startup_id: startup.id})
                                        toast.success(
                                            `You are no longer following ${startup.name}`
                                        )
                                    } else {
                                        await followStartup({startup_id: startup.id})
                                        toast.success(
                                            `You are now following ${startup.name}`
                                        )
                                    }
                                }}
                            >
                                {startup.followers.is_following ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <MutualFollowers followers={startup.followers} />
                    <p>{startup.description}</p>
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))"
                }}
            >
                {startup.founders.map((founder) => (
                    <Founder
                        key={founder.id}
                        sessionIsFounder={sessionIsFounder}
                        startup_id={startup.id}
                        founder={founder}
                        editFounder={editFounder}
                        removeFounder={removeFounder}
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
            <Modal isOpen={addFounderModal.isOpen} onClose={addFounderModal.onClose}>
                <ModalContent>
                    {(onClose) => (
                        <AddFounderModal
                            startupId={Number(startup.id)}
                            founderIds={startup.founders.map((founder) => founder.id)}
                            onClose={onClose}
                            addFounder={addFounder}
                        />
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={editStartupModal.isOpen} onClose={editStartupModal.onClose}>
                <ModalContent>
                    {(onClose) => (
                        <EditStartupModal
                            startup={startup}
                            onClose={onClose}
                            updateStartup={updateStartup}
                        />
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

function Founder({
    sessionIsFounder,
    startup_id,
    founder,
    editFounder,
    removeFounder
}: {
    sessionIsFounder: boolean
    startup_id: number
    founder: api.Founder
    editFounder: typeof api.edit_founder
    removeFounder: typeof api.remove_founder
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
                    <p className="text-pretty pt-2 my-auto">{founder.keynote}</p>
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
                            <DropdownItem key="edit" onClick={editFounderModal.onOpen}>
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
            <Modal isOpen={editFounderModal.isOpen} onClose={editFounderModal.onClose}>
                <ModalContent>
                    {(onClose) => (
                        <EditFounderModal
                            startup_id={startup_id}
                            founder={founder}
                            onClose={onClose}
                            editFounder={editFounder}
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
                                await removeFounder({
                                    startup_id: startup_id,
                                    founder_id: founder.id
                                })
                                deleteFounderModal.onClose()
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
    editFounder
}: {
    startup_id: number
    founder: api.Founder
    onClose: () => void
    editFounder: typeof api.edit_founder
}) {
    const keynote = useFormInput<HTMLTextAreaElement>({
        default: founder.keynote,
        allowEmpty: true,
        error: api.BIO.getErrorMsg
    })
    const foundedAt = useSignal(new Date(founder.founded_at * 1000))
    async function onSave() {
        if (!keynote.validate({focus: true})) return
        await editFounder({
            startup_id: startup_id,
            founder_id: founder.id,
            keynote: keynote.value.value,
            founded_at: DateToInteger(foundedAt.value)
        })
        onClose()
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
                <Textarea {...keynote.inputProps} variant="bordered" label="Keynote" />
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
    updateStartup
}: {
    startup: api.Startup
    onClose: () => void
    updateStartup: typeof api.update_startup
}) {
    const name = useFormInput({
        default: startup.name,
        error: api.NAME.getErrorMsg,
        onEnter: () => description.ref.current?.focus()
    })
    const description = useFormInput<HTMLTextAreaElement>({
        default: startup.description,
        allowEmpty: true,
        error: api.BIO.getErrorMsg,
        onEnter: () => banner.ref.current?.focus()
    })
    const banner = useFormInput({
        default: startup.banner,
        allowEmpty: true,
        error: api.URL.getErrorMsg,
        onEnter: onSave
    })
    const foundedAt = useSignal(new Date(startup.founded_at * 1000))
    async function onSave() {
        if (!name.validate({focus: true})) return
        if (!description.validate({focus: true})) return
        if (!banner.validate({focus: true})) return
        await updateStartup({
            startup_id: startup.id,
            name: name.value.value,
            description: description.value.value,
            banner: banner.value.value,
            founded_at: DateToInteger(foundedAt.value)
        })
        onClose()
        toast.success("Startup updated")
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
    addFounder
}: {
    startupId: number
    founderIds: number[]
    onClose: () => void
    addFounder: typeof api.add_founder
}) {
    const [user, fetchUser] = useQuery(
        (): Promise<MethodResult<api.UserHandle | null>> =>
            api.find_user({username: username.value.peek()})
    )
    const username = useFormInput({
        error: (value) => {
            if (value.trim() === "") {
                return
            }
            if (user.type === QueryType.ERROR) {
                return "Network error"
            }
            if (user.value === null) {
                return "User not found"
            }
            if (founderIds.includes(user.value!.id)) {
                return "User is already a founder"
            }
            return api.USERNAME.getErrorMsg(value)
        },
        allowEmpty: false,
        onDebounce: fetchUser
    })
    const keynote = useFormInput<HTMLTextAreaElement>({
        allowEmpty: true,
        error: api.BIO.getErrorMsg
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
        if (user.type !== QueryType.OK || user.value === null) return
        await addFounder({
            startup_id: startupId,
            founder_id: user.value.id,
            keynote: keynote.value.value,
            founded_at: DateToInteger(foundedAt.value)
        })
        onClose()
        toast.success("Founder added")
    }
    return (
        <>
            <ModalHeader>Add founder</ModalHeader>
            <ModalBody>
                {user.type === QueryType.LOADING ?
                    <Spinner />
                :   user.value && (
                        <UserHandle
                            username={user.value.username}
                            avatar={user.value.avatar}
                            name={user.value.name}
                            followerCount={user.value.follower_count}
                        />
                    )
                }
                <Input
                    label="Username"
                    startContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">@</span>
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
                <Textarea {...keynote.inputProps} variant="bordered" label="Keynote" />
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={onAddFounder}>
                    Add
                </Button>
            </ModalFooter>
        </>
    )
}
