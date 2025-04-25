import {AiOutlineDashboard} from 'react-icons/ai'
import {GoGear} from 'react-icons/go'
import {NavItem} from '@/components/NavItem'
import {IoPieChartOutline} from 'react-icons/io5'

const navItems = [
    {to: '/', icon: <AiOutlineDashboard/>, label: 'Dashboard'},
    {to: '/admin', icon: <GoGear/>, label: 'Admin'},
    {to: '/charts', icon: <IoPieChartOutline/>, label: 'Charts'},
]

export function Nav() {
    return (
        <nav className="flex justify-end gap-4">
            {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
            ))}
        </nav>
    )
}