import {createBrowserRouter} from "react-router-dom"
import {Root} from "~/routes/Root"
import {RootLayout} from "~/routes/RootLayout"
import {CreateAccount} from "./routes/CreateAccount"
import {User} from "./routes/User"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                path: "/",
                element: <Root />,
            },
            {
                path: "/user/:username",
                element: <User />,
            },
        ],
    },
    {
        path: "/create-account",
        element: <CreateAccount />,
    },
])
