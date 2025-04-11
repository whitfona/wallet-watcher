import {Link} from 'react-router'
import {AiOutlineDashboard} from 'react-icons/ai'
import {GoGear} from 'react-icons/go'

export function Nav() {
    return (
        <nav className="flex justify-end gap-4">
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-700">
                <AiOutlineDashboard/>
                <Link to={'/'}>Dashboard</Link>
            </div>
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-700">
                <GoGear/>
                <Link to={'/admin'}>Admin</Link>
            </div>
        </nav>
    )
}