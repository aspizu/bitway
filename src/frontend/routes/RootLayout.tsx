import {Outlet} from "react-router-dom"
import {Header} from "~/components/Header"

export function RootLayout() {
    return (
        <main className="h-full">
            <Header />
            <Outlet />
        </main>
    )
}
