import {supabase} from '@/utils/supabase'
import {useEffect, useState} from 'react'
import {CategoryBreakdownPieChart} from '@/charts/CategoryBreakdownPieChart'
import {useToast} from '@/components/Toast'
import {AnnualInflowOutflowBarChart} from '@/charts/AnnualInflowOutflowBarChart'
import type {CategoryExpenseData, MainCategoryData} from '@/types/common'
import {formatCurrency} from '@/utils/helpers'
import {getCategoryTotals} from '@/dashboard/services/categoryService'
import {ExpenseCategoryBreakdown} from '@/charts/ExpenseCategoryBreakdown'
import {DialogCalendar} from '@/components/DialogCalendar'

export function Index() {
    const toast = useToast()

    const [loading, setLoading] = useState(true)
    const [mainCategoryData, setMainCategoryData] = useState<MainCategoryData[]>([])
    const [categoryTotalsError, setCategoryTotalsError] = useState<string | null>(null)
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())

    const getCategoryTotalsLocal = async (): Promise<void> => {
        setLoading(true)
        setCategoryTotalsError(null)

        try {
            console.log('Fetching expenses data...')
            const endMonth = month === 12 ? 1 : month + 1
            const endYear = month === 12 ? year + 1 : year

            const {data: categoriesData, error} = await supabase
                .from('expenses')
                .select('inflow, outflow, categories(name)')
                .gte('date', `${year}-${month}-01`)
                .lte('date', `${endYear}-${endMonth}-01`)
                .neq('category_id', 5) // exclude "income" category

            if (error) {
                toast.error('Failed to fetch expenses')
                setCategoryTotalsError(error.message)
                return
            }

            if (!categoriesData || categoriesData.length === 0) {
                setMainCategoryData([])
                return
            }

            const mainCategoryDataArray = await getCategoryTotals(categoriesData)
            setMainCategoryData(mainCategoryDataArray)
        } catch (error) {
            toast.error('Error categorizing expenses')
            setCategoryTotalsError('Error loading expenses')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        ;(() => getCategoryTotalsLocal())()
    }, [month, year])

    const onDateChange = async (month: number, year: number) => {
        setMonth(month)
        setYear(year)
    }

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
                        <DialogCalendar
                            initialMonth={month}
                            initialYear={year}
                            onDateChange={onDateChange}
                        />
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
