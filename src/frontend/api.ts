
        import {type MethodResult, App} from "reproca/app"
        import {circuitBreakerMiddleware} from "~/query"
        import {StringType} from "vald/src/index"
        const app = new App(import.meta.env.VITE_BACKEND, circuitBreakerMiddleware())
        export const USERNAME = new StringType().max(32, 'Username cannot be longer than $ characters.').min(3, 'Username must be at least $ characters long.').regex('[.\\-_a-zA-Z][.\\-_a-zA-Z0-9]*', 'Username can only contain letters, numbers, dots, hyphens, and underscores.')
export const PASSWORD = new StringType().min(8, 'Password must be at least $ characters long.')
export const EMAIL = new StringType().email()
export const NAME = new StringType().notEmpty('Name cannot be empty.').max(64, 'Name cannot be longer than $ characters.')
export const BIO = new StringType().empty().max(256, 'Bio cannot be longer than $ characters.')
export const URL = new StringType().empty().max(1024, 'URL cannot be longer than $ characters.').url()
export const BLOG_TITLE = new StringType().notEmpty('Title cannot be empty.').max(128, 'Title cannot be longer than $ characters.')
export const BLOG_CONTENT = new StringType().notEmpty('Content cannot be empty.').max(4096, 'Content cannot be longer than $ characters.')
export const POLL_OPTION = new StringType().notEmpty('Option cannot be empty.').max(128, 'Option cannot be longer than $ characters.')
/** Create a blog post. */
export async function post_blog(parameters: PostBlogParameters):Promise<MethodResult<((number)|(null))>>{return await app.method('post_blog', parameters);}
/** Delete a blog post. */
export async function delete_blog(parameters: DeleteBlogParameters):Promise<MethodResult<null>>{return await app.method('delete_blog', parameters);}
/** Get all blog posts. */
export async function get_blogs(parameters: GetBlogsParameters = {}):Promise<MethodResult<(Blog)[]>>{return await app.method('get_blogs', parameters);}
/** Vote in a poll. */
export async function vote_poll(parameters: VotePollParameters):Promise<MethodResult<null>>{return await app.method('vote_poll', parameters);}
/** Create a startup. */
export async function create_startup(parameters: CreateStartupParameters):Promise<MethodResult<((number)|(null))>>{return await app.method('create_startup', parameters);}
/** Only founders can delete startups. */
export async function delete_startup(parameters: DeleteStartupParameters):Promise<MethodResult<null>>{return await app.method('delete_startup', parameters);}
/** Only founders can edit startups. */
export async function update_startup(parameters: UpdateStartupParameters):Promise<MethodResult<null>>{return await app.method('update_startup', parameters);}
/** Get a startup. */
export async function get_startup(parameters: GetStartupParameters):Promise<MethodResult<((Startup)|(null))>>{return await app.method('get_startup', parameters);}
/** Follow a startup. */
export async function follow_startup(parameters: FollowStartupParameters):Promise<MethodResult<null>>{return await app.method('follow_startup', parameters);}
/** Unfollow a startup. */
export async function unfollow_startup(parameters: UnfollowStartupParameters):Promise<MethodResult<null>>{return await app.method('unfollow_startup', parameters);}
/** Fails if startup is not founded by current user. */
export async function add_founder(parameters: AddFounderParameters):Promise<MethodResult<null>>{return await app.method('add_founder', parameters);}
/** Edit a founder. */
export async function edit_founder(parameters: EditFounderParameters):Promise<MethodResult<null>>{return await app.method('edit_founder', parameters);}
/** Remove a founder from a startup, only founders can remove other founders. */
export async function remove_founder(parameters: RemoveFounderParameters):Promise<MethodResult<null>>{return await app.method('remove_founder', parameters);}
/** Return session user. */
export async function get_session(parameters: GetSessionParameters = {}):Promise<MethodResult<((Session)|(null))>>{return await app.method('get_session', parameters);}
/** Login to account. */
export async function login(parameters: LoginParameters):Promise<MethodResult<boolean>>{return await app.method('login', parameters);}
/** Logout from account. */
export async function logout(parameters: LogoutParameters = {}):Promise<MethodResult<null>>{return await app.method('logout', parameters);}
/** Register new user. */
export async function register(parameters: RegisterParameters):Promise<MethodResult<boolean>>{return await app.method('register', parameters);}
/** Change password if old password is given, requires user be logged-in. */
export async function set_password(parameters: SetPasswordParameters):Promise<MethodResult<boolean>>{return await app.method('set_password', parameters);}
/** Change given details for user. */
export async function update_user(parameters: UpdateUserParameters):Promise<MethodResult<null>>{return await app.method('update_user', parameters);}
/** Follow a user. */
export async function follow_user(parameters: FollowUserParameters):Promise<MethodResult<null>>{return await app.method('follow_user', parameters);}
/** Unfollow a user. */
export async function unfollow_user(parameters: UnfollowUserParameters):Promise<MethodResult<null>>{return await app.method('unfollow_user', parameters);}
/** Get all information about user. */
export async function get_user(parameters: GetUserParameters):Promise<MethodResult<((User)|(null))>>{return await app.method('get_user', parameters);}
/** Find user by username. */
export async function find_user(parameters: FindUserParameters):Promise<MethodResult<((UserHandle)|(null))>>{return await app.method('find_user', parameters);}
/** Return top users. */
export async function top_users(parameters: TopUsersParameters = {}):Promise<MethodResult<(UserHandle)[]>>{return await app.method('top_users', parameters);}
export interface UnfollowUserParameters{user_id:number;}export interface VotePollParameters{blog_id:number;option_id:number;}export interface RemoveFounderParameters{startup_id:number;founder_id:number;}export interface GetStartupParameters{startup_id:number;}/** Startup. */
export interface Startup{id:number;name:string;description:string;banner:string;founded_at:number;created_at:number;founders:(Founder)[];followers:Followers;}export interface SetPasswordParameters{old_password:string;new_password:string;}export interface UnfollowStartupParameters{startup_id:number;}export interface FindUserParameters{username:string;}export interface LoginParameters{username:string;password:string;}export interface DeleteStartupParameters{startup_id:number;}/** User. */
export interface User{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;followers:Followers;blogs:(UserBlog)[];startups:(UserStartup)[];}export interface PostBlogParameters{title:string;content:string;poll_options:(((string)[])|(null));}export interface EditFounderParameters{startup_id:number;founder_id:number;keynote:string;founded_at:number;}export interface RegisterParameters{username:string;password:string;name:string;email:string;avatar:string;bio:string;link:string;}export interface FollowUserParameters{user_id:number;}export interface GetBlogsParameters{}export interface GetUserParameters{username:string;}/** User handle. */
export interface UserHandle{id:number;username:string;name:string;avatar:string;follower_count:number;}/** Reproca session store. */
export interface Session{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;}export interface FollowStartupParameters{startup_id:number;}export interface CreateStartupParameters{name:string;description:string;banner:string;founded_at:number;}export interface GetSessionParameters{}export interface UpdateUserParameters{name:string;email:string;avatar:string;bio:string;link:string;}export interface AddFounderParameters{startup_id:number;founder_id:number;keynote:string;founded_at:number;}export interface TopUsersParameters{}/** Blog post. */
export interface Blog{author_id:number;username:string;name:string;avatar:string;follower_count:number;blog_id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}export interface DeleteBlogParameters{blog_id:number;}export interface UpdateStartupParameters{startup_id:number;name:string;description:string;banner:string;founded_at:number;}export interface LogoutParameters{}/** User startup. */
export interface UserStartup{id:number;name:string;description:string;keynote:string;banner:string;founded_at:number;created_at:number;follower_count:number;}/** Poll. */
export interface Poll{options:(PollOption)[];my_vote_id:((number)|(null));}/** Startup founder. */
export interface Founder{id:number;username:string;name:string;avatar:string;keynote:string;founded_at:number;follower_count:number;}export interface Followers{mutuals:(Follower)[];follower_count:number;is_following:boolean;}/** Blog posted by user. */
export interface UserBlog{id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}/** Poll Option. */
export interface PollOption{id:number;option:string;votes:number;}/** Follower or following. */
export interface Follower{id:number;username:string;name:string;avatar:string;created_at:number;}