import {Button} from "@nextui-org/react"
import {useNavigate} from "react-router-dom"

export function NotFound({message}: {message: string}) {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
                <p className="font-extralight text-8xl">404</p>
                <p className="">{message}</p>
            </div>
            <Button
                color="primary"
                variant="shadow"
                size="lg"
                onClick={() => {
                    navigate("/")
                }}
            >
                Home
            </Button>
        </div>
    )
}
