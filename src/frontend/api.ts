import {type MethodResponse, Service} from "~/reproca"
import {StringType} from "vald/src/index"
const service = new Service(import.meta.env["VITE_BACKEND"])
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
export async function post_blog(title:string,content:string,poll_options:(((string)[])|(null))):Promise<MethodResponse<((number)|(null))>>{return await service.call('/post_blog', {title,content,poll_options})}
/** Delete a blog post. */
export async function delete_blog(blog_id:number):Promise<MethodResponse<null>>{return await service.call('/delete_blog', {blog_id})}
/** Get all blog posts. */
export async function get_blogs():Promise<MethodResponse<(Blog)[]>>{return await service.call('/get_blogs', {})}
/** Vote in a poll. */
export async function vote_poll(blog_id:number,option_id:number):Promise<MethodResponse<null>>{return await service.call('/vote_poll', {blog_id,option_id})}
/** Return session user. */
export async function get_session():Promise<MethodResponse<((UserSession)|(null))>>{return await service.call('/get_session', {})}
/** Login to account. */
export async function login(username:string,password:string):Promise<MethodResponse<boolean>>{return await service.call('/login', {username,password})}
/** Logout from account. */
export async function logout():Promise<MethodResponse<null>>{return await service.call('/logout', {})}
/** Register new user. */
export async function register(username:string,password:string,name:string,email:string,avatar:string,bio:string,link:string):Promise<MethodResponse<boolean>>{return await service.call('/register', {username,password,name,email,avatar,bio,link})}
/** Change password if old password is given, requires user be logged-in. */
export async function set_password(old_password:string,new_password:string):Promise<MethodResponse<boolean>>{return await service.call('/set_password', {old_password,new_password})}
/** Change given details for user. */
export async function update_user(name:string,email:string,avatar:string,bio:string,link:string):Promise<MethodResponse<null>>{return await service.call('/update_user', {name,email,avatar,bio,link})}
/** Follow a user. */
export async function follow_user(user_id:number):Promise<MethodResponse<null>>{return await service.call('/follow_user', {user_id})}
/** Unfollow a user. */
export async function unfollow_user(user_id:number):Promise<MethodResponse<null>>{return await service.call('/unfollow_user', {user_id})}
/** Get all information about user. */
export async function get_user(username:string):Promise<MethodResponse<((User)|(null))>>{return await service.call('/get_user', {username})}
/** Find user by username. */
export async function find_user(username:string):Promise<MethodResponse<((UserHandle)|(null))>>{return await service.call('/find_user', {username})}
/** Return top users. */
export async function top_users():Promise<MethodResponse<(UserHandle)[]>>{return await service.call('/top_users', {})}
/** Create a startup. */
export async function create_startup(name:string,description:string,banner:string,founded_at:number):Promise<MethodResponse<((number)|(null))>>{return await service.call('/create_startup', {name,description,banner,founded_at})}
/** Only founders can delete startups. */
export async function delete_startup(startup_id:number):Promise<MethodResponse<null>>{return await service.call('/delete_startup', {startup_id})}
/** Only founders can edit startups. */
export async function update_startup(startup_id:number,name:string,description:string,banner:string,founded_at:number):Promise<MethodResponse<null>>{return await service.call('/update_startup', {startup_id,name,description,banner,founded_at})}
/** Get a startup. */
export async function get_startup(startup_id:number):Promise<MethodResponse<((Startup)|(null))>>{return await service.call('/get_startup', {startup_id})}
/** Follow a startup. */
export async function follow_startup(startup_id:number):Promise<MethodResponse<null>>{return await service.call('/follow_startup', {startup_id})}
/** Unfollow a startup. */
export async function unfollow_startup(startup_id:number):Promise<MethodResponse<null>>{return await service.call('/unfollow_startup', {startup_id})}
/** Fails if startup is not founded by current user. */
export async function add_founder(startup_id:number,founder_id:number,keynote:string,founded_at:number):Promise<MethodResponse<null>>{return await service.call('/add_founder', {startup_id,founder_id,keynote,founded_at})}
/** Edit a founder. */
export async function edit_founder(startup_id:number,founder_id:number,keynote:string,founded_at:number):Promise<MethodResponse<null>>{return await service.call('/edit_founder', {startup_id,founder_id,keynote,founded_at})}
/** Remove a founder from a startup, only founders can remove other founders. */
export async function remove_founder(startup_id:number,founder_id:number):Promise<MethodResponse<null>>{return await service.call('/remove_founder', {startup_id,founder_id})}
/** User. */
export interface User{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;followers:Followers;blogs:(UserBlog)[];startups:(UserStartup)[];}/** Reproca session store. */
export interface UserSession{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;}/** Startup. */
export interface Startup{id:number;name:string;description:string;banner:string;founded_at:number;created_at:number;founders:(Founder)[];followers:Followers;}/** User handle. */
export interface UserHandle{id:number;username:string;name:string;avatar:string;follower_count:number;}/** Blog post. */
export interface Blog{author_id:number;username:string;name:string;avatar:string;follower_count:number;blog_id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}export interface Followers{mutuals:(Follower)[];follower_count:number;is_following:boolean;}/** Startup founder. */
export interface Founder{id:number;username:string;name:string;avatar:string;keynote:string;founded_at:number;follower_count:number;}/** Blog posted by user. */
export interface UserBlog{id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}/** User startup. */
export interface UserStartup{id:number;name:string;description:string;keynote:string;banner:string;founded_at:number;created_at:number;follower_count:number;}/** Poll. */
export interface Poll{options:(PollOption)[];my_vote_id:((number)|(null));}/** Follower or following. */
export interface Follower{id:number;username:string;name:string;avatar:string;created_at:number;}/** Poll Option. */
export interface PollOption{id:number;option:string;votes:number;}