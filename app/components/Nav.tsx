import {AiOutlineDashboard} from 'react-icons/ai'
import {GoGear} from 'react-icons/go'
import {IoPieChartOutline} from 'react-icons/io5'
import {PiSignOut} from 'react-icons/pi'
import {NavItem,} from '@/components/NavItem'
import {NavItemButton, type NavItemButtonProps} from '@/components/NavItemButton'
import {supabase} from '@/utils/supabase'

export function Nav() {
    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    const navItems = [
        {to: '/', icon: <AiOutlineDashboard/>, label: 'Dashboard'},
        {to: '/charts', icon: <IoPieChartOutline/>, label: 'Charts'},
        {to: '/admin', icon: <GoGear/>, label: 'Admin'},
        {onClick: handleSignOut, icon: <PiSignOut/>, label: 'Sign Out'},
    ]

    return (
        <nav className="flex justify-end gap-4">
            {navItems.map((item) =>
                item.to ? (
                    <NavItem key={item.to} {...item} />
                ) : (
                    <NavItemButton key={item.label} {...item as NavItemButtonProps} />
                )
            )}
        </nav>
    )
}