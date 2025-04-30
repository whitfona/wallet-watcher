import ProtectedRoute from '@/auth/ProtectedRoute'
import {Outlet} from 'react-router'

export default function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <Outlet/>
        </ProtectedRoute>
    )
}
