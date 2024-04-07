import {
    Avatar,
    Button,
    Card,
    CardBody,
    Input,
    Textarea,
} from "@nextui-org/react"
import {useSignal} from "@preact/signals-react"
import toast from "react-hot-toast"
import {useNavigate} from "react-router-dom"
import * as api from "~/api"
import {useFormInput} from "~/hooks/form"
import {Icon} from "~/icons"
import {DateToInteger} from "~/misc"
import {session} from "~/session"

export function CreateStartup() {
    const navigate = useNavigate()
    const name = useFormInput({
        onEnter: () => description.ref.current?.focus(),
    })
    const description = useFormInput<HTMLTextAreaElement>({onEnter: onSubmit})
    const banner = useFormInput({
        allowEmpty: true,
        onEnter: () => description.ref.current?.focus(),
    })
    const foundedAt = useSignal(new Date())
    async function onSubmit() {
        if (!name.validate({focus: true})) return
        if (!description.validate({focus: true})) return
        if (!banner.validate({focus: true})) return
        const response = await api.create_startup(
            name.value.value,
            description.value.value,
            banner.value.value,
            DateToInteger(foundedAt.value)
        )
        if (response.ok) {
            toast.success("Your startup is live!")
            setTimeout(() => {
                navigate(`/startup/${response.ok}`)
            }, 200)
        } else {
            toast.error("Something went wrong.")
        }
    }
    if (!session.value) return null
    return (
        <main className="main-page gap-4">
            <p className="font-medium text-2xl">Create a startup</p>
            <div className="flex items-center gap-4">
                <Avatar
                    className="flex-shrink-0"
                    size="lg"
                    src={session.value.avatar}
                />
                <Input label="Name" size="lg" {...name.inputProps} />
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
                <CardBody className="gap-4">
                    <Input
                        label="Founded on"
                        size="sm"
                        type="date"
                        value={foundedAt.value.toISOString().split("T")[0]}
                        onChange={(ev) => {
                            foundedAt.value = ev.target.valueAsDate!
                        }}
                    />
                    <Input
                        label="Banner URL"
                        size="sm"
                        variant="underlined"
                        {...banner.inputProps}
                    />
                    <Textarea
                        variant="faded"
                        label="Description"
                        {...description.inputProps}
                    />
                </CardBody>
            </Card>
        </main>
    )
}
