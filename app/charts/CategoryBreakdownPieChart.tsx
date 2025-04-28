import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts'
import {formatCurrency} from '@/utils/helpers'
import type {CategoryExpenseData} from '@/types/common'

interface CategoryBreakdownPieChartProps {
    displayData: CategoryExpenseData[]
}

export const CategoryBreakdownPieChart = (
    {displayData}: CategoryBreakdownPieChartProps
) => {
    return (
        <>
            {displayData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={displayData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={160}
                                fill="#8884d8"
                            >
                                {displayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>)
                : <p>No expense data</p>
            }
        </>
    )
}