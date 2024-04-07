import {type MethodResponse, Service} from "~/reproca"
const service = new Service(import.meta.env["VITE_BACKEND"])
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
export async function register(username:string,password:string,name:string,email:string):Promise<MethodResponse<boolean>>{return await service.call('/register', {username,password,name,email})}
/** Change password if old password is given, requires user be logged-in. */
export async function set_password(old_password:string,new_password:string):Promise<MethodResponse<boolean>>{return await service.call('/set_password', {old_password,new_password})}
/** Change given details for user. */
export async function update_user(avatar:((string)|(null)),link:((string)|(null)),email:((string)|(null)),name:((string)|(null)),bio:((string)|(null))):Promise<MethodResponse<null>>{return await service.call('/update_user', {avatar,link,email,name,bio})}
/** Follow a user. */
export async function follow_user(user_id:number):Promise<MethodResponse<null>>{return await service.call('/follow_user', {user_id})}
/** Unfollow a user. */
export async function unfollow_user(user_id:number):Promise<MethodResponse<null>>{return await service.call('/unfollow_user', {user_id})}
/** Get all information about user. */
export async function get_user(username:string):Promise<MethodResponse<((User)|(null))>>{return await service.call('/get_user', {username})}
/** Get all users. */
export async function get_users():Promise<MethodResponse<(UserHandle)[]>>{return await service.call('/get_users', {})}
/** Find user by username. */
export async function find_user(username:string):Promise<MethodResponse<((FoundUser)|(null))>>{return await service.call('/find_user', {username})}
/** Create a startup. */
export async function create_startup(name:string,description:string,banner:string,founded_at:number):Promise<MethodResponse<((number)|(null))>>{return await service.call('/create_startup', {name,description,banner,founded_at})}
/** Fails if startup is not founded by current user. */
export async function add_founder(startup_id:number,founder_id:number,founded_at:number):Promise<MethodResponse<null>>{return await service.call('/add_founder', {startup_id,founder_id,founded_at})}
/** Remove a founder from a startup, only founders can remove other founders. */
export async function remove_founder(startup_id:number,founder_id:number):Promise<MethodResponse<null>>{return await service.call('/remove_founder', {startup_id,founder_id})}
/** Only founders can delete startups. */
export async function delete_startup(startup_id:number):Promise<MethodResponse<null>>{return await service.call('/delete_startup', {startup_id})}
/** Only founders can edit startups. */
export async function edit_startup(startup_id:number,name:string,description:string,banner:string,founded_at:number):Promise<MethodResponse<null>>{return await service.call('/edit_startup', {startup_id,name,description,banner,founded_at})}
/** Get a startup. */
export async function get_startup(startup_id:number):Promise<MethodResponse<((Startup)|(null))>>{return await service.call('/get_startup', {startup_id})}
/** Startup. */
export interface Startup{id:number;name:string;description:string;banner:string;founded_at:number;created_at:number;founders:(Founder)[];}/** Found User. */
export interface FoundUser{id:number;name:string;avatar:string;}/** User handle. */
export interface UserHandle{id:number;username:string;name:string;avatar:string;follower_count:number;following_count:number;}/** Blog post. */
export interface Blog{author_id:number;username:string;name:string;avatar:string;follower_count:number;blog_id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}/** User. */
export interface User{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;followers:(Follower)[];following:(Follower)[];blogs:(UserBlog)[];}/** Reproca session store. */
export interface UserSession{id:number;username:string;name:string;email:string;avatar:string;link:string;bio:string;created_at:number;last_seen_at:number;}/** Poll. */
export interface Poll{options:(PollOption)[];my_vote_id:((number)|(null));}/** Follower or following. */
export interface Follower{id:number;username:string;name:string;avatar:string;created_at:number;}/** Blog posted by user. */
export interface UserBlog{id:number;title:string;content:string;poll:((Poll)|(null));created_at:number;}/** Startup founder. */
export interface Founder{id:number;username:string;name:string;avatar:string;founded_at:number;follower_count:number;}/** Poll Option. */
export interface PollOption{id:number;option:string;votes:number;}