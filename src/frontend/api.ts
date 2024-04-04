import {type MethodResponse, Service} from "~/reproca"
const service = new Service(import.meta.env["VITE_BACKEND"])
/** Create a blog post. */
export async function post_blog(title:string,content:string):Promise<MethodResponse<((number)|(null))>>{return await service.call('/post_blog', {title,content})}
/** Get all blogs posted by user. */
export async function get_user_blogs(user_id:number):Promise<MethodResponse<(UserBlog)[]>>{return await service.call('/get_user_blogs', {user_id})}
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
/** User. */
export interface User{id:number;username:string;name:string;email:string;avatar:string;link:string;created_at:number;last_seen_at:number;followers:(Follower)[];following:(Follower)[];}/** Reproca session store. */
export interface UserSession{id:number;username:string;name:string;email:string;avatar:string;link:string;created_at:number;last_seen_at:number;}/** Blog posted by user. */
export interface UserBlog{id:number;title:string;content:string;created_at:number;}/** Follower or following. */
export interface Follower{id:number;username:string;name:string;avatar:string;created_at:number;}