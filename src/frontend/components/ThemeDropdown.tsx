import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react"
import {Icon} from "~/icons"
import {isDark, theme} from "../theme"

export function ThemeDropdown() {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly variant="light" radius="full">
                    <Icon>{isDark.value ? "dark_mode" : "light_mode"}</Icon>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Theme"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={[theme.value]}
                onSelectionChange={(keys) => {
                    theme.value = [...keys][0] as any
                    console.log(theme.value)
                }}
            >
                <DropdownItem key="SYSTEM">System</DropdownItem>
                <DropdownItem key="LIGHT">Light</DropdownItem>
                <DropdownItem key="DARK">Dark</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
