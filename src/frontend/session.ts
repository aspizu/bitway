import {signal} from "@preact/signals-react"
import * as api from "~/api"

export const session = signal<api.UserSession | null>(null)

export async function fetchSession() {
    const response = await api.get_session()
    if (response.ok) {
        session.value = response.ok
    } else {
        session.value = null
    }
}
