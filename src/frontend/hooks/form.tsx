import {Signal, useSignal} from "@preact/signals-react"
import {useRef, type KeyboardEvent, type MutableRefObject, type RefObject} from "react"

export interface FormInputOptions {
    onEnter?: () => void
    error?: (value: string) => string | null | undefined
    default?: string
    allowEmpty?: boolean
    onDebounce?: () => void
}

export interface FormInput<T> {
    value: Signal<string>
    err: Signal<string>
    ref: RefObject<T>
    debounce: MutableRefObject<number | undefined>
    validate(options?: {focus?: true; noCallback?: true}): boolean
    inputProps: {
        ref: RefObject<T>
        value: string
        isInvalid: boolean
        errorMessage: string
        onInput: () => void
        onKeyUp: (ev: KeyboardEvent<HTMLInputElement>) => void
    }
}

export function useFormInput<T extends HTMLInputElement>(
    options?: FormInputOptions
): FormInput<HTMLInputElement>
export function useFormInput<T extends HTMLTextAreaElement>(
    options?: FormInputOptions
): FormInput<HTMLTextAreaElement>
export function useFormInput<T extends HTMLInputElement | HTMLTextAreaElement>(
    {onEnter, error, default: default_, allowEmpty, onDebounce}: FormInputOptions = {
        default: "",
        allowEmpty: false
    }
): FormInput<T> {
    const value = useSignal(default_ ?? "")
    const err = useSignal<string>("")
    const ref = useRef<T>(null)
    const debounce = useRef<number | undefined>(undefined)
    /** Return true if input was valid. */
    function validate(options?: {focus?: true; noCallback?: true}) {
        err.value = error?.(value.value) ?? ""
        let isInvalid = Boolean(err.value)
        if (!allowEmpty && value.value.trim() === "") {
            isInvalid = true
        }
        if (options?.focus && isInvalid) {
            ref.current?.focus()
        }
        if (!options?.noCallback) onDebounce?.()
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
                        onEnter?.()
                    }
                }
            }
        }
    }
}
