export function usernameError(value: string) {
    if (value.length > 64) {
        return "Username cannot be longer than 64 characters."
    }
    if (!/^[a-zA-Z0-9\-_]{0,64}$/.test(value)) {
        return "Username can only contain letters and numbers."
    }
}

export function passwordError(value: string) {
    if (1 <= value.length && value.length < 8) {
        return "Password must be at least 8 characters."
    }
}

export function emailError(value: string) {
    if (
        !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
            value
        )
    ) {
        return "Invalid email address."
    }
}
