import {NextUIProvider} from "@nextui-org/react"
import {StrictMode} from "react"
import {Toaster} from "react-hot-toast"
import {RouterProvider} from "react-router-dom"
import {router} from "./router"

export function Layout() {
    return (
        <StrictMode>
            <NextUIProvider>
                <RouterProvider router={router} />
            </NextUIProvider>
            <Toaster />
        </StrictMode>
    )
}
