import {
    Button,
    Input,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
} from "@nextui-org/react"
import {NavLink} from "react-router-dom"
import bitwayDarkPng from "~/assets/bitway-dark.png"
import bitwayPng from "~/assets/bitway.png"
import {Icon} from "~/icons"
import {session} from "~/session"
import {isDark} from "~/theme"
import {Login} from "./Login"
import {ThemeDropdown} from "./ThemeDropdown"
import {UserDropdown} from "./UserDropdown"

export function Header() {
    return (
        <Navbar isBordered position="sticky" height={"5rem"}>
            <NavbarBrand>
                <NavLink to="/">
                    <img
                        src={isDark.value ? bitwayDarkPng : bitwayPng}
                        alt="bitway"
                        width={70}
                    />
                </NavLink>
            </NavbarBrand>
            <NavbarContent>
                <Input
                    endContent={
                        <Button
                            isIconOnly
                            radius="full"
                            size="sm"
                            variant="light"
                        >
                            <Icon>search</Icon>
                        </Button>
                    }
                />
            </NavbarContent>
            <NavbarContent justify="end">
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
