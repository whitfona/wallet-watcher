import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {formatCurrency} from '@/utils/helpers'
import type {MonthlyCashflowRecord} from '@/types/common'

interface AnnualCashflowBarChartProps {
    displayData: MonthlyCashflowRecord[]
}

export const AnnualCashflowBarChart = (
    {displayData}: AnnualCashflowBarChartProps
) => {

    return (
        <>
            {displayData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart width={730} height={250} data={displayData} margin={{left: 20}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="date"/>
                        <YAxis tickFormatter={(value: number) => formatCurrency(value, 0)}/>
                        <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                        <Legend/>
                        <Bar dataKey="inflow" fill="#05df72"/>
                        <Bar dataKey="outflow" fill="#ff6467"/>
                    </BarChart>
                </ResponsiveContainer>
            ) : <p className="text-gray-400">No expense data for this period</p>}
        </>
    )
}