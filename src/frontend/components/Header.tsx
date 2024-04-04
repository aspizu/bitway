import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/react"
import {NavLink} from "react-router-dom"
import bitwayDarkPng from "~/assets/bitway-dark.png"
import bitwayPng from "~/assets/bitway.png"
import {session} from "~/session"
import {isDark} from "~/theme"
import {Login} from "./Login"
import {ThemeDropdown} from "./ThemeDropdown"
import {UserDropdown} from "./UserDropdown"

export function Header() {
    return (
        <Navbar isBordered>
            <NavbarContent>
                <NavbarBrand>
                    <NavLink to="/">
                        <img
                            src={isDark.value ? bitwayDarkPng : bitwayPng}
                            alt="bitway"
                            width={70}
                        />
                    </NavLink>
                </NavbarBrand>
                <NavbarItem>
                    <ThemeDropdown />
                </NavbarItem>
                <NavbarItem>
                    {session.value ? <UserDropdown /> : <Login />}
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}
