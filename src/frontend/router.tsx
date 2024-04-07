import {createBrowserRouter} from "react-router-dom"
import {Root} from "~/routes/Root"
import {RootLayout} from "~/routes/RootLayout"
import {CreateAccount} from "./routes/CreateAccount"
import {CreatePost} from "./routes/CreatePost"
import {CreateStartup} from "./routes/CreateStartup"
import {NotFoundPage} from "./routes/NotFoundPage"
import {Startup} from "./routes/Startup"
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
            {
                path: "/startup/:startupId",
                element: <Startup />,
            },
            {
                path: "/create-post",
                element: <CreatePost />,
            },
            {
                path: "/create-startup",
                element: <CreateStartup />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
    {
        path: "/create-account",
        element: <CreateAccount />,
    },
])
