import * as api from "~/api"
import {Blog} from "~/components/Blog"
import {useSignalMethod} from "~/reproca"

export function Root() {
    const [blogs, fetchBlogs] = useSignalMethod(() => api.get_blogs(), {
        clearWhileFetching: false,
    })
    return (
        <main className="main-page flex-row gap-4">
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
