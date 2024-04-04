import {signal} from "@preact/signals-react"

export enum Theme {
    SYSTEM = "SYSTEM",
    LIGHT = "LIGHT",
    DARK = "DARK",
}

function parseTheme(theme: string | null): Theme {
    return theme && Object.keys(Theme).includes(theme)
        ? (theme as Theme)
        : Theme.SYSTEM
}

export const theme = signal<Theme>(parseTheme(localStorage.getItem("theme")))

const prefersColorSchemeDark = matchMedia("(prefers-color-scheme: dark)")

export const isDark = signal(false)

function updateIsDark(theme: Theme) {
    isDark.value =
        (theme === Theme.SYSTEM && prefersColorSchemeDark.matches) ||
        theme === Theme.DARK
}

theme.subscribe((value) => {
    updateIsDark(value)
    localStorage.setItem("theme", value)
})

prefersColorSchemeDark.addEventListener("change", () => {
    updateIsDark(theme.value)
})
