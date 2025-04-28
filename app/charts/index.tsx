import {supabase} from '@/utils/supabase'
import {useEffect, useState} from 'react'
import {CategoryBreakdownPieChart} from '@/charts/CategoryBreakdownPieChart'
import {useToast} from '@/components/Toast'
import {AnnualInflowOutflowBarChart} from '@/charts/AnnualInflowOutflowBarChart'
import type {CategoryExpenseData, MainCategoryData} from '@/types/common'
import {formatCurrency} from '@/utils/helpers'
import {getCategoryTotals} from '@/dashboard/services/categoryService'
import {ExpenseCategoryBreakdown} from '@/charts/ExpenseCategoryBreakdown'

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
                .select('inflow, outflow, categories(name)')
                .gte('date', '2025-04-01')
                .lt('date', '2025-05-01')
                .neq('category_id', 5) // exclude "income" category

            if (error) {
                toast.error('Failed to fetch expenses')
                setCategoryTotalsError(error.message)
                return
            }

            if (!data || data.length === 0) {
                setMainCategoryData([])
                return
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
        (() => getCategoryTotalsLocal())()
    }, [])

    // Prepare data for the pie chart (main categories only)
    const pieChartData: CategoryExpenseData[] = mainCategoryData.length > 0
        ? mainCategoryData.map(category => ({
            name: category.name,
            value: category.value,
            color: category.color
        }))
        : []

    const totalExpenses = mainCategoryData.reduce((sum, category) => sum + category.value, 0)

    return (
        <main className="pt-8 pb-4 max-w-4xl mx-auto">
            <header>
                <h1 className="text-center text-2xl font-bold mb-6">Charts</h1>
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
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-center mb-4">Expenses by Category</h2>
                        <div className="h-[400px]">
                            <CategoryBreakdownPieChart displayData={pieChartData}/>
                        </div>
                    </div>

                    {mainCategoryData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">Category Breakdowns</h2>
                            <p className="text-gray-700 mb-6">Total Expenses: {formatCurrency(totalExpenses)}</p>

                            {mainCategoryData.map((mainCategory) => (
                                <ExpenseCategoryBreakdown
                                    key={mainCategory.name}
                                    mainCategory={mainCategory}
                                    totalExpenses={totalExpenses}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AnnualInflowOutflowBarChart/>
        </main>
    )
}
