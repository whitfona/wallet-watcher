import {type RouteConfig, index, route} from '@react-router/dev/routes'

export default [
    index('routes/dashboard.tsx'),
    route('admin', 'routes/admin.tsx'),
    route('charts', 'routes/charts.tsx')
] satisfies RouteConfig
