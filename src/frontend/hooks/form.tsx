import {useSignal} from "@preact/signals-react"
import {useRef, type KeyboardEvent} from "react"

export function useFormInput(
    next: () => void,
    error: (value: string) => string | undefined
) {
    const value = useSignal("")
    const err = useSignal<string>("")
    const ref = useRef<HTMLInputElement>(null)
    const debounce = useRef<number | undefined>(undefined)
    function validate(options?: {focus: true}) {
        err.value = error(value.value) ?? ""
        const isInvalid = !value.value.trim() || err.value
        if (options?.focus) {
            if (isInvalid) {
                ref.current?.focus()
            }
        }
        return !isInvalid
    }
    return {
        value,
        err,
        ref,
        debounce,
        validate,
        inputProps: {
            ref,
            value: value.value,
            isInvalid: Boolean(err.value),
            errorMessage: err.value,
            onInput: () => {
                if (!ref.current) return
                value.value = ref.current.value
                clearTimeout(debounce.current)
                debounce.current = window.setTimeout(validate, 500)
            },
            onKeyUp: (ev: KeyboardEvent<HTMLInputElement>) => {
                if (ev.key === "Enter") {
                    ev.preventDefault()
                    if (validate({focus: true})) {
                        next()
                    }
                }
            },
        },
    }
}

export type FormInput = ReturnType<typeof useFormInput>
