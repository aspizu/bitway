import {
    Avatar,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure
} from "@nextui-org/react"
import toast from "react-hot-toast"
import {useNavigate} from "react-router-dom"
import * as api from "~/api"
import {fetchSession, session} from "~/session"

export function UserDropdown() {
    const navigate = useNavigate()
    const {isOpen, onOpen, onClose} = useDisclosure()
    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <Avatar as="button" isBordered src={session.value?.avatar} />
                </DropdownTrigger>
                <DropdownMenu aria-label="User">
                    <DropdownItem
                        onClick={() => {
                            if (!session.value) return
                            navigate(`/user/${session.value.username}`)
                        }}
                    >
                        Profile
                    </DropdownItem>
                    <DropdownItem
                        onClick={() => {
                            if (!session.value) return
                            navigate("/create-post")
                        }}
                    >
                        Create Post
                    </DropdownItem>
                    <DropdownItem
                        onClick={() => {
                            if (!session.value) return
                            navigate("/create-startup")
                        }}
                    >
                        Create Startup
                    </DropdownItem>
                    <DropdownItem onClick={onOpen}>Logout</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Are you sure you want to log out?</ModalHeader>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    onClick={async () => {
                                        await api.logout()
                                        fetchSession()
                                        toast.success("Logged out successfully.")
                                        onClose()
                                    }}
                                >
                                    Log out
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
