import * as api from "~/api"
import {Blog} from "~/components/Blog"
import {UserHandle} from "~/components/UserHandle"
import {useSignalMethod} from "~/reproca"

export function Root() {
    const [users, fetchUsers] = useSignalMethod(() => api.top_users(), {
        clearWhileFetching: false,
    })
    const [blogs, fetchBlogs] = useSignalMethod(() => api.get_blogs(), {
        clearWhileFetching: false,
    })
    return (
        <main className="main-page gap-4">
            <p className="font-bold">Top Users</p>
            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(15rem, 1fr))",
                }}
            >
                {users.value?.ok &&
                    users.value.ok.map((user) => (
                        <UserHandle
                            key={user.id}
                            username={user.username}
                            name={user.name}
                            avatar={user.avatar}
                            followerCount={user.follower_count}
                        />
                    ))}
            </div>
            <div className="grow flex flex-col gap-4">
                {blogs.value?.ok &&
                    blogs.value.ok.map((blog) => (
                        <Blog
                            key={blog.blog_id}
                            userId={blog.author_id}
                            avatar={blog.avatar}
                            username={blog.username}
                            name={blog.name}
                            followerCount={blog.follower_count}
                            blogId={blog.blog_id}
                            title={blog.title}
                            content={blog.content}
                            createdAt={blog.created_at}
                            poll={blog.poll ?? undefined}
                            onDelete={fetchBlogs}
                        />
                    ))}
            </div>
        </main>
    )
}
