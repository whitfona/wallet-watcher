import type {CategoryValues} from '@/types/common'

export const getCategoryType = (categoryName: string): string => {
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

const MAIN_CATEGORIES = ['Food', 'Fun', 'Travel']
const CATEGORY_COLORS: { [key: string]: string } = {
    'Food': '#00C49F',  // Green
    'Fun': '#FFBB28',   // Yellow
    'Travel': '#0088FE', // Blue
    'Other': '#8884D8',  // Purple
}
// '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'

export const getCategoryTotals = async (expenses) => {
    try {

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
        return mainCategoryDataArray
    } catch (err) {
        throw new Error('An unexpected error occurred', {cause: err})
    }
}