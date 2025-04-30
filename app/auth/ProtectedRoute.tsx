import {Navigate} from 'react-router'
import {useAuth} from '@/Providers/AuthProvider'
import {Loader} from '@/components/Loader'

export default function ProtectedRoute({children}: { children: React.ReactNode }) {
    const {isAuthenticated, isLoading} = useAuth()
    // const location = useLocation()

    if (isLoading) {
        return <Loader/>
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace/>
    }

    return <>{children}</>
}
