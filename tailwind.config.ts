import {nextui} from "@nextui-org/react"
import type {Config} from "tailwindcss"

export default {
    content: [
        "./src/frontend/**/*.{js,ts,jsx,tsx,html}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: "class",
    theme: {
        fontFamily: {
            sans: "Inter",
            mono: "Cascadia Code",
            serif: "Merriweather"
        }
    },
    plugins: [
        nextui({
            addCommonColors: true
        })
    ]
} satisfies Config
