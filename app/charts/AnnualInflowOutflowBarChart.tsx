import {
    Bar,
    BarChart, CartesianAxis,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {formatCurrency} from '@/utils/helpers'

interface CategoryBreakdownPieChartProps {
    displayData: { name: string, value: number }[]
}

export const AnnualInflowOutflowBarChart = () => {
    // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
    //
    // const DEFAULT_DATA = [
    //     {name: 'No Data', value: 100},
    // ]

    const data = [
        {
            'name': 'Jan',
            'inflow': 4000,
            'outflow': 2400
        },
        {
            'name': 'Feb',
            'inflow': 3000,
            'outflow': 1398
        },
        {
            'name': 'Mar',
            'inflow': 2000,
            'outflow': 9800
        },
        {
            'name': 'Apr',
            'inflow': 2780,
            'outflow': 3908
        },
        {
            'name': 'May',
            'inflow': 1890,
            'outflow': 4800
        },
        {
            'name': 'Jun',
            'inflow': 2390,
            'outflow': 3800
        },
        {
            'name': 'Jul',
            'inflow': 3490,
            'outflow': 4300
        },
        {
            'name': 'Aug',
            'inflow': 2490,
            'outflow': 5300
        },
        {
            'name': 'Sep',
            'inflow': 5490,
            'outflow': 3200
        },
        {
            'name': 'Oct',
            'inflow': 4490,
            'outflow': 2200
        },
        {
            'name': 'Nov',
            'inflow': 7590,
            'outflow': 6900
        },
        {
            'name': 'Dec',
            'inflow': 15010,
            'outflow': 9010
        }
    ]
    // const dataToDisplay = displayData && displayData.length > 0 ? displayData : DEFAULT_DATA

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart width={730} height={250} data={data} margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name"/>
                <YAxis tickFormatter={(value: number) => formatCurrency(value, 0)}/>
                <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                <Legend/>
                <Bar dataKey="inflow" fill="#05df72"/>
                <Bar dataKey="outflow" fill="#ff6467"/>
            </BarChart>
        </ResponsiveContainer>
    )
}