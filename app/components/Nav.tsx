import {Link} from 'react-router'

export function Nav() {
    return (
        <nav className="flex justify-center gap-4">
            <Link to={'/'}>Dashboard</Link>
            <Link to={'/admin'}>Admin</Link>
        </nav>
    )
}