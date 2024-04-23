import {formatDuration} from "date-fns"

export function s(count: number) {
    return count === 1 ? "" : "s"
}

export function readTime(content: string): string | null {
    const minutes = Math.round(content.split(" ").length / 50)
    if (minutes < 2) {
        return null
    }
    return `${formatDuration({minutes})} read`
}

export function DateToInteger(date: Date): number {
    return Math.round(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        ) / 1000
    )
}

export function numberFormat(number: number, noun: string): string {
    if (number === 0) {
        return "no " + noun + "s"
    }
    return (
        new Intl.NumberFormat(undefined, {
            notation: "compact",
            compactDisplay: "long"
        }).format(number) +
        " " +
        noun +
        s(number)
    )
}
