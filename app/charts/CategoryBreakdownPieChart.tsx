import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts'
import {formatCurrency} from '@/utils/helpers'

interface CategoryBreakdownPieChartProps {
    displayData: { name: string, value: number }[]
}

export const CategoryBreakdownPieChart = ({displayData}: CategoryBreakdownPieChartProps) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

    const DEFAULT_DATA = [
        {name: 'No Data', value: 100},
    ]

    const dataToDisplay = displayData && displayData.length > 0 ? displayData : DEFAULT_DATA

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={dataToDisplay}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={160}
                    fill="#8884d8"
                >
                    {dataToDisplay.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle"/>
            </PieChart>
        </ResponsiveContainer>
    )
}