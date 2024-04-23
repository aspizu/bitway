import type {ComponentProps} from "react"

export interface IconProps extends Omit<ComponentProps<"div">, "size"> {
    fill?: boolean
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
    grade?: "low" | "medium" | "high"
    opticalSize?: 20 | 24 | 40 | 48
    variant?: "outlined" | "rounded" | "sharp"
    size?: "sm" | "md" | "lg"
}

export function Icon({
    fill = true,
    weight = 400,
    grade = "medium",
    opticalSize = 24,
    variant = "rounded",
    size = "md",
    className,
    ...props
}: IconProps) {
    return (
        <div
            className={`material-symbols-${variant} material-symbols material-symbols--${size} ${className}`}
            style={{
                ["--material-symbols-fill" as any]: fill ? "1" : "0",
                ["--material-symbols-weight" as any]: weight,
                ["--material-symbols-grade" as any]: {
                    low: -25,
                    medium: 0,
                    high: 200
                }[grade],
                ["--material-symbols-optical-size" as any]: opticalSize
            }}
            {...props}
        />
    )
}
