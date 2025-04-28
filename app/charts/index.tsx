import {supabase} from '@/utils/supabase'
import {useEffect, useState} from 'react'
import {CategoryBreakdownPieChart} from '@/charts/CategoryBreakdownPieChart'
import {useToast} from '@/components/Toast'
import {AnnualInflowOutflowBarChart} from '@/charts/AnnualInflowOutflowBarChart'
import type {CategoryExpenseData} from '@/types/common'

// Function to help match category names more flexibly
const getCategoryType = (categoryName: string): string => {
    const lowerName = categoryName.toLowerCase()

    // Food related categories
    if (lowerName.includes('groceries') ||
        lowerName.includes('coffee') ||
        lowerName.includes('tea') ||
        lowerName.includes('meal') ||
        lowerName.includes('nespresso') ||
        lowerName.includes('costco') ||
        lowerName.includes('food')) {
        return 'Food'
    }

    // Fun related categories
    if (lowerName.includes('entertainment') ||
        lowerName.includes('fun money') ||
        lowerName.includes('dates') ||
        lowerName.includes('eating out') ||
        lowerName.includes('books')) {
        return 'Fun'
    }

    // Travel related categories
    if (lowerName.includes('transportation') ||
        lowerName.includes('bus') ||
        lowerName.includes('train') ||
        lowerName.includes('uber') ||
        lowerName.includes('rental car')) {
        return 'Travel'
    }

    // Default to Other if no match
    return 'Other'
}

// Colors for main categories
const CATEGORY_COLORS: { [key: string]: string } = {
    'Food': '#00C49F',  // Green
    'Fun': '#FFBB28',   // Yellow
    'Travel': '#0088FE', // Blue
    'Other': '#8884D8',  // Purple
}
// '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'

// Main categories order
const MAIN_CATEGORIES = ['Food', 'Fun', 'Travel']

interface ExpenseData {
    inflow: number | null
    outflow: number | null
    date: string
    category_id: number
    categories: {
        name: string
    }
}

interface CategoryValues {
    inflow: number
    outflow: number
}

interface MainCategoryData {
    name: string
    value: number
    color: string
    subcategories: {
        [key: string]: {
            inflow: number
            outflow: number
            net: number
        }
    }
}

export function Index() {
    const toast = useToast()

    const [loading, setLoading] = useState(true)
    const [mainCategoryData, setMainCategoryData] = useState<MainCategoryData[]>([])
    const [categoryTotalsError, setCategoryTotalsError] = useState<string | null>(null)

    const getCategoryTotals = async () => {
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

            // If no data, use mock data for testing
            let expenses: ExpenseData[] = []

            if (!data || data.length === 0) {
                console.log('No expense data found, using mock data')
                // Mock data for testing
                expenses = [
                    {
                        inflow: 0,
                        outflow: 150,
                        date: '2025-04-15',
                        category_id: 1,
                        categories: {name: 'Groceries'}
                    },
                    {
                        inflow: 0,
                        outflow: 30,
                        date: '2025-04-20',
                        category_id: 2,
                        categories: {name: 'Coffee/Tea'}
                    },
                    {
                        inflow: 0,
                        outflow: 100,
                        date: '2025-04-10',
                        category_id: 3,
                        categories: {name: 'Entertainment'}
                    },
                    {
                        inflow: 0,
                        outflow: 75,
                        date: '2025-04-05',
                        category_id: 5,
                        categories: {name: 'Transportation'}
                    }
                ]
            } else {
                expenses = data
            }

            console.log('Expense data being processed:', expenses)
            console.log('Unique category names:', [...new Set(expenses.map(e => e.categories?.name))])

            // Initialize data structures for both main categories and subcategories
            const mainCategoryTotals: { [key: string]: CategoryValues } = {}
            const subcategoryTotals: { [key: string]: { [subcategory: string]: CategoryValues } } = {}

            // Initialize all main categories
            MAIN_CATEGORIES.forEach(category => {
                mainCategoryTotals[category] = {inflow: 0, outflow: 0}
                subcategoryTotals[category] = {}
            })

            // Also initialize Other category
            mainCategoryTotals['Other'] = {inflow: 0, outflow: 0}
            subcategoryTotals['Other'] = {}

            // Process each expense
            expenses.forEach(expense => {
                const subcategory = expense.categories?.name || 'Unknown'
                // Use flexible category mapping
                const mainCategory = getCategoryType(subcategory)

                console.log(`Mapping: ${subcategory} -> ${mainCategory}`)

                // Update main category totals
                mainCategoryTotals[mainCategory].inflow += expense.inflow || 0
                mainCategoryTotals[mainCategory].outflow += expense.outflow || 0

                // Update subcategory totals
                if (!subcategoryTotals[mainCategory][subcategory]) {
                    subcategoryTotals[mainCategory][subcategory] = {inflow: 0, outflow: 0}
                }
                subcategoryTotals[mainCategory][subcategory].inflow += expense.inflow || 0
                subcategoryTotals[mainCategory][subcategory].outflow += expense.outflow || 0
            })

            // Convert totals into the format needed for the pie chart and detailed breakdown
            const mainCategoryDataArray = Object.entries(mainCategoryTotals).map(([name, values]) => {
                // Calculate net for display
                const netValue = Math.abs(values.outflow - values.inflow)

                // Convert subcategory data for this main category
                const subcategoryDetails = subcategoryTotals[name] || {}
                const formattedSubcategories: { [key: string]: any } = {}

                Object.entries(subcategoryDetails).forEach(([subName, subValues]) => {
                    formattedSubcategories[subName] = {
                        inflow: subValues.inflow,
                        outflow: subValues.outflow,
                        net: Math.abs(subValues.outflow - subValues.inflow)
                    }
                })

                return {
                    name,
                    value: netValue,
                    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
                    subcategories: formattedSubcategories
                }
            }).filter(category => category.value > 0) // Only include categories with values

            // Sort categories by main category order
            mainCategoryDataArray.sort((a, b) => {
                const indexA = MAIN_CATEGORIES.indexOf(a.name)
                const indexB = MAIN_CATEGORIES.indexOf(b.name)
                if (indexA === -1) return 1
                if (indexB === -1) return -1
                return indexA - indexB
            })

            console.log('Processed main category data:', mainCategoryDataArray)
            setMainCategoryData(mainCategoryDataArray)
        } catch (err) {
            console.error('Unexpected error:', err)
            setCategoryTotalsError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getCategoryTotals()
    }, [])

    // Prepare data for the pie chart (main categories only)
    const pieChartData: CategoryExpenseData[] = mainCategoryData.length > 0
        ? mainCategoryData.map(category => ({
            name: category.name,
            value: category.value,
            color: category.color
        }))
        : []

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

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
                    <p>Error loading data</p>
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
