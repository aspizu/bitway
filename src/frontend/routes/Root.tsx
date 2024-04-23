import {Spinner} from "@nextui-org/react"
import * as api from "~/api"
import {Blog} from "~/components/Blog"
import {UserHandle} from "~/components/UserHandle"
import {QueryType, useMutation, useQuery} from "~/query"

export function Root() {
    const [users] = useQuery(api.top_users)
    const [blogs, fetchBlogs] = useQuery(api.get_blogs)
    const deleteBlog = useMutation(blogs, fetchBlogs, api.delete_blog, {
        update: (signal, {blog_id}) => {
            const index = signal.findIndex((blog) => blog.blog_id === blog_id)
            if (index === -1) throw new Error("Blog not found")
            signal.splice(index, 1)
        }
    })
    const votePoll = useMutation(blogs, fetchBlogs, api.vote_poll, {
        update: (signal, {blog_id, option_id}) => {
            const blog = signal.find((blog) => blog.blog_id === blog_id)
            if (!blog) throw new Error("Blog not found")
            if (!blog.poll) throw new Error("Blog has no poll")
            const poll = blog.poll
            if (poll.my_vote_id !== null) {
                const votedOption = poll.options.find(
                    (option) => option.id === poll.my_vote_id
                )
                if (!votedOption) throw new Error("Voted option not found")
                votedOption.votes -= 1
            }
            const option = poll.options.find((option) => option.id === option_id)
            if (!option) throw new Error("Option not found")
            option.votes += 1
            poll.my_vote_id = option_id
        }
    })
    return (
        <main className="main-page gap-4">
            <p className="font-bold">Top Users</p>
            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))"
                }}
            >
                {users.type === QueryType.LOADING ?
                    <Spinner />
                :   users.value.map((user) => (
                        <UserHandle
                            key={user.id}
                            username={user.username}
                            name={user.name}
                            avatar={user.avatar}
                            followerCount={user.follower_count}
                        />
                    ))
                }
            </div>
            <div className="grow flex flex-col gap-4">
                {blogs.type === QueryType.LOADING ?
                    <Spinner />
                :   blogs.value.map((blog) => (
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
                            deleteBlog={deleteBlog}
                            votePoll={votePoll}
                        />
                    ))
                }
            </div>
        </main>
    )
}
