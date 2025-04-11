import {NavLink} from 'react-router'
import type {ReactNode} from 'react'

interface NavItemProps {
    to: string
    icon: ReactNode
    label: string
}

export function NavItem({to, icon, label}: NavItemProps) {
    return (
        <NavLink 
            to={to} 
            className={({isActive}) => 
                `flex items-center gap-1 ${isActive ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'}`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    )
} 