import {effect} from "@preact/signals-react"
import "material-symbols"
import {createRoot} from "react-dom/client"
import {Layout} from "~/layout"
import "~/main.css"
import {isDark} from "~/theme"
import {fetchSession} from "./session"

isDark.subscribe((isDark) => {
    if (isDark) {
        document.body.classList.add("dark")
    } else {
        document.body.classList.remove("dark")
    }
})

const root = createRoot(document.getElementById("app")!)
root.render(<Layout />)

effect(() => {
    fetchSession()
})
