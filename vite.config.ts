import react from "@vitejs/plugin-react"
import {fileURLToPath, URL} from "url"
import {defineConfig} from "vite"
export default defineConfig({
    root: "./src/frontend",
    envDir: "../../",
    publicDir: "./public",
    resolve: {
        alias: [
            {
                find: "~",
                replacement: fileURLToPath(
                    new URL("./src/frontend", import.meta.url)
                ),
            },
        ],
    },
    plugins: [
        react({
            babel: {
                plugins: [["module:@preact/signals-react-transform"]],
            },
        }),
    ],
    build: {
        target: "esnext",
    },
    // server: {
    //     proxy: {
    //         "/proxy": {
    //             target: import.meta.env["VITE_PROXY"],
    //             rewrite: (path) => path.replace(/^\/proxy/, ""),
    //         },
    //     },
    // },
})
