import {supabase} from '@/utils/supabase'
import React, {useEffect, useState} from 'react'
import {CategoryBreakdownPieChart} from '@/charts/components/CategoryBreakdownPieChart'
import {useToast} from '@/components/Toast'
import {AnnualCashflowBarChart} from '@/charts/components/AnnualCashflowBarChart'
import type {CategoryExpenseData, MainCategoryData, MonthlyCashflowRecord} from '@/types/common'
import {formatCurrency} from '@/utils/helpers'
import {getCategoryTotals} from '@/dashboard/services/categoryService'
import {ExpenseCategoryBreakdown} from '@/charts/components/ExpenseCategoryBreakdown'
import {DialogCalendar} from '@/components/DialogCalendar'
import {YearSelector} from '@/components/YearSelector'

export function Index() {
    const toast = useToast()

    const [loadingCategories, setLoadingCategories] = useState(true)
    const [mainCategoryData, setMainCategoryData] = useState<MainCategoryData[]>([])
    const [categoryTotalsError, setCategoryTotalsError] = useState<string | null>(null)
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())

    const getCategoryTotalsLocal = async (): Promise<void> => {
        setLoadingCategories(true)
        setCategoryTotalsError(null)

        try {
            const endMonth = month === 12 ? 1 : month + 1
            const endYear = month === 12 ? year + 1 : year

            const {
                data: categoriesData,
                error
            } = await supabase.rpc('get_monthly_expenses_by_category', {
                start_date: `${year}-${month}-01`,
                end_date: `${endYear}-${endMonth}-01`
            })

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
            setLoadingCategories(false)
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

    const [cashflowYear, setCashflowYear] = useState<number>(new Date().getFullYear())

    const [loadingCashflowData, setLoadingCashflowData] = useState(true)
    const [cashflowData, setCashflowData] = useState<MonthlyCashflowRecord[]>([])
    const [cashflowDataError, setCashflowDataError] = useState<string | null>(null)

    const getAnnualCashflow = async (): Promise<void> => {
        setLoadingCashflowData(true)
        setCashflowDataError(null)

        try {
            const {data: cashflowData, error} = await supabase.rpc('get_annual_cashflow', {year_input: cashflowYear})

            if (error) {
                toast.error('Failed to fetch cashflow data')
                setCashflowDataError(error.message)
                return
            }

            if (!cashflowData || cashflowData.length === 0) {
                cashflowData([])
                return
            }

            setCashflowData(cashflowData)
        } catch (error) {
            toast.error('Error fetching cashflow data')
            setCashflowDataError('Error loading cashflow data')
        } finally {
            setLoadingCashflowData(false)
        }
    }

    useEffect(() => {
        ;(() => getAnnualCashflow())()
    }, [cashflowYear])
    return (
        <main className="pt-8 pb-4 max-w-4xl mx-auto space-y-6">
            <header>
                <h1 className="text-center text-2xl font-bold mb-6">Charts</h1>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center mb-4">Expenses by Category</h2>
                <DialogCalendar
                    initialMonth={month}
                    initialYear={year}
                    onDateChange={onDateChange}
                />

                <div className={`flex justify-center flex-col ${pieChartData.length > 0 ? 'h-[480px]' : ''}`}>
                    {loadingCategories ? (
                        <div className="flex justify-center p-8">
                            <p>Loading chart data...</p>
                        </div>
                    ) : categoryTotalsError ? (
                        <div className="text-red-500 p-4 text-center">
                            <p>{categoryTotalsError}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <CategoryBreakdownPieChart displayData={pieChartData}/>
                        </div>
                    )}
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

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-center mb-4">Annual Cashflows</h2>
                <YearSelector
                    className="w-fit mx-auto"
                    year={cashflowYear}
                    setYearChange={setCashflowYear}
                />

                <div className="h-[480px] flex justify-center flex-col">
                    {loadingCashflowData ? (
                        <div className="flex justify-center p-8">
                            <p>Loading chart data...</p>
                        </div>
                    ) : cashflowDataError ? (
                        <div className="text-red-500 p-4 text-center">
                            <p>{cashflowDataError}</p>
                        </div>
                    ) : (
                        <AnnualCashflowBarChart displayData={cashflowData}/>
                    )}
                </div>
            </div>
        </main>
    )
}
