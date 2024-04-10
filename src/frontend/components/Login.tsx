import {
    Button,
    Input,
    Link as LinkUI,
    Popover,
    PopoverContent,
    PopoverTrigger,
    type DOMAttributes,
} from "@nextui-org/react"
import {useSignal} from "@preact/signals-react"
import toast from "react-hot-toast"
import {Link} from "react-router-dom"
import * as api from "~/api"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {fetchSession} from "~/session"

function LoginPopover({
    titleProps: _,
}: {
    titleProps: DOMAttributes<HTMLElement>
}) {
    const password = useFormInput({
        onEnter: onLogin,
        error: api.PASSWORD.getErrorMsg,
    })
    const username = useFormInput({
        onEnter: () => password.ref.current?.focus(),
        error: api.USERNAME.getErrorMsg,
    })
    const isVisible = useSignal(false)
    async function onLogin() {
        if (!(username.ref.current && password.ref.current)) return
        if (!username.validate({focus: true})) return
        if (!password.validate({focus: true})) return
        const response = await api.login(
            username.value.value,
            password.value.value
        )
        if (response.ok) {
            toast.success("Logged in successfully.")
            fetchSession()
        } else {
            toast.error("Incorrect password.")
            password.err.value = "Incorrect password."
        }
    }
    return (
        <div className="flex flex-col gap-3 py-2 min-w-[20rem]">
            <Input label="Username" {...username.inputProps} />
            <Input
                label="Password"
                {...password.inputProps}
                type={isVisible.value ? "text" : "password"}
                endContent={
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        onClick={() => {
                            isVisible.value = !isVisible.value
                        }}
                    >
                        <Icon>
                            {isVisible.value ? "visibility" : "visibility_off"}
                        </Icon>
                    </Button>
                }
            />
            <div className="flex gap-3">
                <LinkUI as="p" className="grow">
                    <Link to="/create-account">or create an account</Link>
                </LinkUI>
                <Button color="primary" onClick={onLogin}>
                    Login
                </Button>
            </div>
        </div>
    )
}

export function Login() {
    return (
        <Popover>
            <PopoverTrigger>
                <Button color="primary">Login</Button>
            </PopoverTrigger>
            <PopoverContent>
                {(titleProps) => <LoginPopover titleProps={titleProps} />}
            </PopoverContent>
        </Popover>
    )
}
