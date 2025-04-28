import {supabase} from '@/utils/supabase'
import {useEffect, useState} from 'react'
import {CategoryBreakdownPieChart} from '@/charts/CategoryBreakdownPieChart'
import {useToast} from '@/components/Toast'
import {AnnualInflowOutflowBarChart} from '@/charts/AnnualInflowOutflowBarChart'
import type {CategoryExpenseData, MainCategoryData} from '@/types/common'
import {formatCurrency} from '@/utils/helpers'
import {getCategoryTotals} from '@/dashboard/services/categoryService'

export function Index() {
    const toast = useToast()

    const [loading, setLoading] = useState(true)
    const [mainCategoryData, setMainCategoryData] = useState<MainCategoryData[]>([])
    const [categoryTotalsError, setCategoryTotalsError] = useState<string | null>(null)

    const getCategoryTotalsLocal = async () => {
        setLoading(true)
        setCategoryTotalsError(null)

        try {
            console.log('Fetching expenses data...')
            const {data, error} = await supabase
                .from('expenses')
                .select('inflow, outflow, date, category_id, categories(name)')
                .gte('date', '2025-04-01')
                .lt('date', '2025-05-01')
                .neq('category_id', 5) // exclude "income" category

            if (error) {
                toast.error('Failed to fetch expenses')
                setCategoryTotalsError(error.message)
                return
            }

            if (!data || data.length === 0) {
                toast.error('No expense data found')
            }

            const mainCategoryDataArray = await getCategoryTotals(data)
            setMainCategoryData(mainCategoryDataArray)
        } catch (error) {
            toast.error('Error categorizing expenses')
            setCategoryTotalsError('Error loading expenses')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getCategoryTotalsLocal()
    }, [])

    // Prepare data for the pie chart (main categories only)
    const pieChartData: CategoryExpenseData[] = mainCategoryData.length > 0
        ? mainCategoryData.map(category => ({
            name: category.name,
            value: category.value,
            color: category.color
        }))
        : []

    // Calculate total expenses
    const totalExpenses = mainCategoryData.reduce((sum, category) => sum + category.value, 0)

    return (
        <main className="pt-8 pb-4 max-w-4xl mx-auto">
            <header>
                <h1 className="text-center text-2xl font-bold mb-6">Expense Analysis</h1>
            </header>

            {loading ? (
                <div className="flex justify-center p-8">
                    <p>Loading chart data...</p>
                </div>
            ) : categoryTotalsError ? (
                <div className="text-red-500 p-4 text-center">
                    <p>{categoryTotalsError}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Debug info - comment out in production */}
                    <div className="bg-gray-100 p-4 rounded-lg text-xs">
                        <p>Debug: {pieChartData.map(item => `${item.name}: ${item.value}`).join(', ')}</p>
                    </div>

                    {/* Main Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-center mb-4">Expenses by Main Category</h2>
                        <div className="h-[400px]">
                            <CategoryBreakdownPieChart displayData={pieChartData}/>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {mainCategoryData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                            <p className="text-gray-700 mb-4">Total Expenses: {formatCurrency(totalExpenses)}</p>

                            <div className="space-y-6">
                                {mainCategoryData.map((mainCategory) => (
                                    <div key={mainCategory.name} className="border-b pb-4 last:border-b-0">
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
                                ))}
                            </div>
                        </div>
                    )}

                    {mainCategoryData.length === 0 && !categoryTotalsError && (
                        <p className="text-center mt-4">No expense data found for the selected period</p>
                    )}
                </div>
            )}

            <AnnualInflowOutflowBarChart/>
        </main>
    )
}
