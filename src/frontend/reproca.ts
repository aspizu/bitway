import {signal, useSignal, useSignalEffect} from "@preact/signals-react"
import {useRef} from "react"

export enum MethodError {
    UnauthorizedError,
    ProtocolError,
    NetworkError,
}

export type Result<T, E> = {ok: T; err?: never} | {ok?: never; err: E}
export type MethodResponse<T> = Result<T, MethodError>

export class Service {
    host: string

    constructor(host: string) {
        this.host = host
    }

    async call(path: string, args: Record<string, any>): Promise<any> {
        return this.fetch(
            () =>
                fetch(`${this.host}${path}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(args),
                    credentials: "include",
                }),
            (response) =>
                `Service responded with ${
                    response.statusText
                } when calling ${path} with arguments ${JSON.stringify(args)}`
        )
    }

    async callWithFiles(
        files: Iterable<Blob>,
        path: string,
        args: Record<string, any>
    ): Promise<any> {
        const formData = new FormData()
        formData.append("body", JSON.stringify(args))
        let i = 0
        for (const file of files) {
            formData.append(`file_${i}`, file)
            i++
        }
        return this.fetch(
            () =>
                fetch(`${this.host}${path}`, {
                    method: "POST",
                    body: formData,
                }),
            (response) =>
                `Service responded with ${
                    response.statusText
                } when calling ${path} with arguments ${JSON.stringify(
                    args
                )} and some uploaded files`
        )
    }

    async fetch(
        fetch: () => Promise<Response>,
        failureContext: (response: Response) => string
    ): Promise<any> {
        let response: Response
        try {
            response = await fetch()
        } catch (err) {
            if (err instanceof TypeError) {
                if (
                    err.message.includes("NetworkError") ||
                    err.message.includes("Failed to fetch")
                ) {
                    return {err: MethodError.NetworkError}
                }
            }
            throw err
        }
        if (response.ok) {
            return {ok: await response.json()}
        }
        if (response.status === 400) {
            return {err: MethodError.ProtocolError}
        }
        if (response.status === 401) {
            return {err: MethodError.UnauthorizedError}
        }
        throw new Error(failureContext(response))
    }
}

const DEFAULT_MAX_RETRY_ATTEMPTS = 5

export function useSignalMethod<T>(
    method: () => Promise<MethodResponse<T>>,
    options: {
        retryInterval?: number
        maxRetryAttempts?: number
        clearWhileFetching?: boolean
    } = {
        clearWhileFetching: true,
    }
) {
    const response = useSignal<MethodResponse<T> | undefined>(undefined)
    const attempts = useRef(0)
    const retryInterval = useRef<number | undefined>(undefined)
    async function retry() {
        if (
            attempts.current >
            (options.maxRetryAttempts ?? DEFAULT_MAX_RETRY_ATTEMPTS)
        ) {
            clearInterval(retryInterval.current)
            retryInterval.current = undefined
            return
        }
        if (options.clearWhileFetching) {
            response.value = undefined
        }
        response.value = await method()
        if (response.value.err !== MethodError.NetworkError) {
            clearInterval(retryInterval.current)
            retryInterval.current = undefined
        }
    }
    function fetch() {
        retry()
        attempts.current = 0
        clearInterval(retryInterval.current)
        if (options.retryInterval) {
            retryInterval.current = window.setInterval(
                retry,
                options.retryInterval
            )
            return () => clearInterval(retryInterval.current)
        }
    }
    useSignalEffect(fetch)
    return [response, fetch] as const
}

export function signalMethod<T>(
    method: () => Promise<MethodResponse<T>>,
    options: {
        retryInterval?: number
        maxRetryAttempts?: number
    } = {}
) {
    const response = signal<MethodResponse<T> | undefined>(undefined)
    let attempts = 0
    async function retry() {
        if (
            attempts > (options.maxRetryAttempts ?? DEFAULT_MAX_RETRY_ATTEMPTS)
        ) {
            clearInterval(retryInterval)
            retryInterval = undefined
            return
        }
        attempts++
        response.value = await method()
        if (response.value.err !== MethodError.NetworkError) {
            clearInterval(retryInterval)
            retryInterval = undefined
        }
    }
    let retryInterval: number | undefined =
        options.retryInterval &&
        window.setInterval(retry, options.retryInterval)
    retry()
    return [
        response,
        () => {
            attempts = 0
            clearInterval(retryInterval)
            if (options.retryInterval) {
                retryInterval = window.setInterval(retry, options.retryInterval)
            }
            retry()
        },
    ] as const
}
