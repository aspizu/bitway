import {NotFound} from "~/components/NotFound"

export function NotFoundPage() {
    return (
        <main className="main-page items-center gap-4">
            <NotFound message="Page not found" />
        </main>
    )
}
