import {formatCurrency} from '@/utils'

interface BalanceSummaryProps {
    inflowsTotal: number
    outflowsTotal: number
    negativeMonthlyTotal: boolean
    className?: string
}

export const BalanceSummary = ({inflowsTotal, outflowsTotal, negativeMonthlyTotal, className}: BalanceSummaryProps) => {
    return (
        <div className={`flex flex-row gap-4 ${className}`}>
            <div>
                <p className="text-green-600 text-xl">{formatCurrency(inflowsTotal)}</p>
                <p className="text-xs text-gray-500">Inflows</p>
            </div>
            <p>-</p>
            <div>
                <p className="text-xl">{formatCurrency(outflowsTotal)}</p>
                <p className="text-xs text-gray-500">Outflows</p>
            </div>
            <p>=</p>
            <div>
                <p className={`${negativeMonthlyTotal ? 'text-red-600' : 'text-green-600'} text-xl`}>{formatCurrency(inflowsTotal - outflowsTotal)}</p>
                <p className="text-xs text-gray-500">Monthly Total</p>
            </div>
        </div>
    )
}