import {type RouteConfig, index, route, layout} from '@react-router/dev/routes'

export default [
    // Public route
    route('sign-in', 'routes/auth.tsx'),

    // Protected layout route with children
    layout('routes/(protected)/_layout.tsx', [
        index('routes/(protected)/dashboard.tsx'),
        route('admin', 'routes/(protected)/admin.tsx'),
        route('charts', 'routes/(protected)/charts.tsx'),
    ]),
]