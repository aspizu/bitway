import {
    Avatar,
    Button,
    Card,
    CardBody,
    Input,
    Link as LinkUI,
} from "@nextui-org/react"
import {Signal, useSignal} from "@preact/signals-react"
import {useEffect} from "react"
import toast from "react-hot-toast"
import {Link, useNavigate} from "react-router-dom"
import * as api from "~/api"
import {useFormInput, type FormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {emailError, passwordError, usernameError} from "~/models"

enum Page {
    USERNAME_PASSWORD,
    AVATAR_NAME_EMAIL,
}

function UsernamePassword({
    username,
    password,
    repeatPassword,
}: {
    username: FormInput<HTMLInputElement>
    password: FormInput<HTMLInputElement>
    repeatPassword: FormInput<HTMLInputElement>
}) {
    return (
        <>
            <Input type="text" label="Username" {...username.inputProps} />
            <Input type="password" label="Password" {...password.inputProps} />
            <Input
                type="password"
                label="Repeat password"
                {...repeatPassword.inputProps}
            />
        </>
    )
}

function AvatarNameEmail({
    page,
    name,
    email,
}: {
    page: Signal<Page>
    name: FormInput<HTMLInputElement>
    email: FormInput<HTMLInputElement>
}) {
    return (
        <>
            <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="flat"
                onClick={() => {
                    page.value = Page.USERNAME_PASSWORD
                }}
            >
                <Icon>arrow_back</Icon>
            </Button>

            <Input type="text" label="name" {...name.inputProps} />
            <Input type="email" label="email" {...email.inputProps} />
            <div className="absolute top-[-3rem] left-[50%] translate-x-[-50%] flex flex-col items-center">
                <Avatar
                    size="lg"
                    style={{
                        scale: "2",
                    }}
                />
                <Button size="sm" color="primary" radius="full">
                    <Icon>upload</Icon>
                    Upload
                </Button>
            </div>
        </>
    )
}

export function CreateAccount() {
    const navigate = useNavigate()
    useEffect(() => {
        document.body.classList.add("create-account-background")
        return () => {
            document.body.classList.remove("create-account-background")
        }
    }, [])
    const page = useSignal<Page>(Page.USERNAME_PASSWORD)
    const repeatPassword = useFormInput({
        onEnter: nextPage,
        error: (value) => {
            if (value !== password.value.value) {
                return "Passwords do not match."
            }
        },
    })
    const password = useFormInput({
        onEnter: () => repeatPassword.ref.current?.focus(),
        error: passwordError,
    })
    const username = useFormInput({
        onEnter: () => password.ref.current?.focus(),
        error: usernameError,
    })
    const email = useFormInput({onEnter: onRegister, error: emailError})
    const name = useFormInput({
        onEnter: () => email.ref.current?.focus(),
        error: (value) => {
            if (value.length > 64) {
                return "Name cannot be longer than 64 characters."
            }
        },
    })
    function nextPage() {
        if (!username.validate({focus: true})) return
        if (!password.validate({focus: true})) return
        if (!repeatPassword.validate({focus: true})) return
        if (!name.value.value.trim()) {
            name.value.value = username.value.value
        }
        page.value = Page.AVATAR_NAME_EMAIL
        setTimeout(() => {
            email.ref.current?.focus()
        }, 400)
    }
    async function onRegister() {
        const response = await api.register(
            username.value.value,
            password.value.value,
            name.value.value,
            email.value.value
        )
        if (response.ok) {
            toast.success("Account created successfully.")
            navigate("/")
        } else {
            toast.error("Username already exists.")
            page.value = Page.USERNAME_PASSWORD
            username.err.value = "Username already exists."
            setTimeout(() => {
                username.ref.current?.focus()
            }, 400)
        }
    }
    return (
        <main className="flex flex-col md:flex-row h-[100dvh] items-center justify-center gap-8">
            <div className="flex flex-col md:w-[17rem] pl-3 gap-3">
                <p className="font-serif font-light text-[3rem] md:text-[3.5rem] leading-[0.95] text-pretty">
                    Create an account
                </p>
                <LinkUI as="p">
                    <Link to="/">or log into existing account</Link>
                </LinkUI>
            </div>
            <Card className="md:w-[25rem] w-full bg-transparent shadow-none md:bg-content1 md:shadow-medium overflow-visible">
                <CardBody className="gap-4 overflow-visible">
                    {page.value === Page.USERNAME_PASSWORD ? (
                        <UsernamePassword
                            username={username}
                            password={password}
                            repeatPassword={repeatPassword}
                        />
                    ) : page.value === Page.AVATAR_NAME_EMAIL ? (
                        <AvatarNameEmail
                            page={page}
                            name={name}
                            email={email}
                        />
                    ) : null}
                </CardBody>
            </Card>
            <Button
                isIconOnly
                color="primary"
                variant="shadow"
                radius="full"
                size="lg"
                onClick={() => {
                    if (page.value === Page.USERNAME_PASSWORD) {
                        nextPage()
                    } else if (page.value === Page.AVATAR_NAME_EMAIL) {
                        onRegister()
                    }
                }}
            >
                <Icon size="lg">arrow_forward</Icon>
            </Button>
        </main>
    )
}
