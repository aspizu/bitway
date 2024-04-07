import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Input,
    Textarea,
} from "@nextui-org/react"
import {useSignal} from "@preact/signals-react"
import {useRef} from "react"
import toast from "react-hot-toast"
import {useNavigate} from "react-router-dom"
import * as api from "~/api"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {session} from "~/session"

export function CreatePost() {
    const navigate = useNavigate()
    const title = useFormInput({
        onEnter: () => content.ref.current?.focus(),
    })
    const content = useFormInput<HTMLTextAreaElement>({onEnter: onSubmit})
    const pollOptions = useSignal<string[]>([])
    const pollRef = useRef<HTMLDivElement>(null)
    async function onSubmit() {
        if (
            pollOptions.value.filter((option) => option.trim() === "")
                .length !== 0
        ) {
            toast.error("Poll options cannot be empty")
            return
        }
        if (!title.validate({focus: true})) return
        if (!content.validate({focus: true})) return
        const response = await api.post_blog(
            title.value.value,
            content.value.value,
            pollOptions.value.length === 0 ? null : pollOptions.value
        )
        if (response.ok) {
            toast.success("Your post is live!")
            navigate("/")
        }
    }
    if (!session.value) return null
    return (
        <main className="main-page gap-4">
            <p className="font-medium text-2xl">Create a post</p>
            <div className="flex items-center gap-4">
                <Avatar
                    className="flex-shrink-0"
                    size="lg"
                    src={session.value.avatar}
                />
                <Input label="Title" size="lg" {...title.inputProps} />
                <Button
                    isIconOnly
                    radius="full"
                    size="lg"
                    color="primary"
                    variant="shadow"
                    onClick={onSubmit}
                >
                    <Icon size="lg">arrow_forward</Icon>
                </Button>
            </div>
            <Card>
                <CardBody>
                    <Textarea
                        variant="faded"
                        placeholder="Say something..."
                        {...content.inputProps}
                    />
                </CardBody>
                <Divider />
                <CardFooter className="flex-col items-stretch gap-4">
                    {pollOptions.value.length !== 0 && (
                        <div ref={pollRef} className="flex flex-col gap-4">
                            {pollOptions.value.map((option, index) => (
                                <Input
                                    key={index}
                                    placeholder={`Poll option ${index + 1}`}
                                    variant="bordered"
                                    onKeyDown={(ev) => {
                                        if (ev.key === "Enter") {
                                            ev.preventDefault()
                                            if (
                                                index ===
                                                pollOptions.value.length - 1
                                            ) {
                                                pollOptions.value = [
                                                    ...pollOptions.value,
                                                    "",
                                                ]
                                                setTimeout(() => {
                                                    pollRef.current?.children[
                                                        index + 1
                                                    ]
                                                        .querySelector("input")
                                                        ?.focus()
                                                }, 200)
                                            }
                                            pollRef.current?.children[index + 1]
                                                .querySelector("input")
                                                ?.focus()
                                        }
                                    }}
                                    value={option}
                                    onInput={(ev) => {
                                        pollOptions.value =
                                            pollOptions.value.map((o, i) =>
                                                i === index
                                                    ? (
                                                          ev.target as HTMLInputElement
                                                      ).value
                                                    : o
                                            )
                                    }}
                                    endContent={
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            radius="full"
                                            onClick={() => {
                                                pollOptions.value =
                                                    pollOptions.value.filter(
                                                        (_, i) => i !== index
                                                    )
                                            }}
                                        >
                                            <Icon>delete</Icon>
                                        </Button>
                                    }
                                />
                            ))}
                        </div>
                    )}
                    <Button
                        className="mr-auto"
                        color="primary"
                        size="sm"
                        onClick={() => {
                            pollOptions.value = [...pollOptions.value, ""]
                        }}
                    >
                        {pollOptions.value.length === 0
                            ? "Add Poll"
                            : "Add Poll Option"}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}
