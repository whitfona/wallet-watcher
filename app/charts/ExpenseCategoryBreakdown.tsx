import {formatCurrency} from '@/utils/helpers'
import type {MainCategoryData} from '@/types/common'

interface ExpenseCategoryBreakdownProps {
    mainCategory: MainCategoryData
    totalExpenses: number
}

export const ExpenseCategoryBreakdown = ({mainCategory, totalExpenses}: ExpenseCategoryBreakdownProps) => {
    return (
        <div key={mainCategory.name} className="border-b pb-4 border-gray-400 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium flex items-center">
                    <span
                        className="inline-block w-4 h-4 rounded-full mr-2"
                        style={{backgroundColor: mainCategory.color}}
                    ></span>
                    {mainCategory.name}
                </h3>
                <div className="font-semibold">
                    {formatCurrency(mainCategory.value)}
                    <span className="text-gray-500 text-sm ml-2">
                        ({((mainCategory.value / totalExpenses) * 100).toFixed(1)}%)
                    </span>
                </div>
            </div>

            {/* Subcategories */}
            <div className="pl-6 space-y-1 mt-2">
                {Object.entries(mainCategory.subcategories)
                    .sort(([, a], [, b]) => b.net - a.net) // Sort by net value descending
                    .map(([subName, subValues]) => (
                        <div key={subName} className="flex justify-between text-sm">
                            <span className="text-gray-700">{subName}</span>
                            <span>{formatCurrency(subValues.net)}</span>
                        </div>
                    ))}
            </div>
        </div>
    )
}