import type {ReactNode} from 'react'

export interface NavItemButtonProps {
    onClick: () => void
    icon: ReactNode
    label: string
}

export function NavItemButton({onClick, icon, label}: NavItemButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-700 cursor-pointer"
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}