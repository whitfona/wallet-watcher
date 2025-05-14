import type {CategoryExpenseRecord, CategoryValues} from '@/types/common'

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

export const getCategoryTotals = async (expenses: CategoryExpenseRecord[]) => {
    try {
        // Initialize data structures for both main categories and subcategories
        const mainCategoryTotals: { [key: string]: CategoryValues } = {}
        const subcategoryTotals: { [key: string]: { [subcategory: string]: CategoryValues } } = {}

        // Initialize all main categories
        MAIN_CATEGORIES.forEach(category => {
            mainCategoryTotals[category] = {inflow: 0, outflow: 0}
            subcategoryTotals[category] = {}
        })

        // TODO: Do we have an 'Other' category or will it just be 'Misc'?
        // Also initialize Other category
        mainCategoryTotals['Other'] = {inflow: 0, outflow: 0}
        subcategoryTotals['Other'] = {}

        expenses.forEach(expense => {
            const subcategory = expense.category || 'Unknown'
            const mainCategory = getCategoryType(subcategory)

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
        })
        // }).filter(category => category.value > 0) // Only include categories with values

        // // Sort categories by main category order
        // mainCategoryDataArray.sort((a, b) => {
        //     const indexA = MAIN_CATEGORIES.indexOf(a.name)
        //     const indexB = MAIN_CATEGORIES.indexOf(b.name)
        //     if (indexA === -1) return 1
        //     if (indexB === -1) return -1
        //     return indexA - indexB
        // })

        return mainCategoryDataArray
    } catch (err) {
        throw new Error('An unexpected error occurred', {cause: err})
    }
}

export const categorizeExpense = async (expense: ImportedExpense, categories: SelectInterface[]): Promise<SelectInterface | undefined> => {
    if (expense.category) {
        const match = categories.find(category =>
            category.label.toLowerCase().includes(expense.category!.toLowerCase())
        )

        if (match) {
            return match
        }
    }

    if (!expense.account || !expense.payee) {
        return undefined
    }

    const lowerCasePayee = expense.payee.toLowerCase()
    const isNicksAccount = expense.account && expense.account.toLowerCase().includes('nick')
    const isJillsAccount = expense.account && expense.account.toLowerCase().includes('jill')

    /**** Amazon ****/
    if (lowerCasePayee.includes('amazon prime')) {
        return categories.find(category => category.label.toLowerCase().includes('amazon'))
    }

    /**** Apple iCloud ****/
    if (lowerCasePayee.includes('apple bill') &&
        expense.outflow !== null && expense.outflow === 4.51
    ) {
        if (expense.account.toLowerCase().includes('nick')) {
            return categories.find(category => category.label.toLowerCase().includes('nick apple icloud'))
        } else {
            return categories.find(category => category.label.toLowerCase().includes('jill apple icloud'))
        }
    }

    /**** Bank Fees ****/
    if (lowerCasePayee.includes('monthly fee')) {
        return categories.find(category => category.label.toLowerCase().includes('bank fee'))
    }

    /**** Coffee/Tea (Timmies) ****/
    if (lowerCasePayee.includes('tim hortons') ||
        lowerCasePayee.includes('second cup') ||
        lowerCasePayee.includes('cafe') ||
        lowerCasePayee.includes('coffee')
    ) {
        return categories.find(category => category.label.toLowerCase().includes('coffee'))
    }

    /**** Communauto Subscription ****/
    if (lowerCasePayee.includes('communauto') &&
        expense?.outflow !== null &&
        expense.outflow < 7
    ) {
        return categories.find(category => category.label.toLowerCase().includes('communauto subscription'))
    }
    /**** Communauto Usage ****/
    if (lowerCasePayee.includes('communauto') &&
        expense?.outflow !== null &&
        expense.outflow >= 7
    ) {
        return categories.find(category => category.label.toLowerCase().includes('communauto usage'))
    }

    /**** Costco ****/
    if (lowerCasePayee.includes('costco')) {
        return categories.find(category => category.label.toLowerCase().includes('costco'))
    }

    /**** Essential Health ****/
    if (lowerCasePayee.includes('optometry')) {
        return categories.find(category => category.label.toLowerCase().includes('essential'))
    }

    /**** Gas (Enbridge) ****/
    if (lowerCasePayee.includes('enbridge')) {
        return categories.find(category => category.label.toLowerCase().includes('gas'))
    }

    /**** Groceries ****/
    if (lowerCasePayee.includes('food basics') || lowerCasePayee.includes('fortino') || lowerCasePayee.includes('zarky')) {
        return categories.find(category => category.label.toLowerCase().includes('groceries'))
    }

    /**** Gym ****/
    if (isNicksAccount && lowerCasePayee.includes('revive')) {
        return categories.find(category => category.label.toLowerCase().includes('nick gym'))
    }
    if (isJillsAccount && lowerCasePayee.includes('revive')) {
        return categories.find(category => category.label.toLowerCase().includes('jill gym'))
    }

    /**** Haircuts ****/
    if (lowerCasePayee.includes('maison fritz') || lowerCasePayee.includes('prime choice')) {
        return categories.find(category => category.label.toLowerCase().includes('haircut'))
    }

    /**** Home Insurance (Dublin Intact) ****/
    if (lowerCasePayee.includes('insurance')) {
        return categories.find(category => category.label.toLowerCase().includes('insurance'))
    }

    /**** Hydro (Alectra) ****/
    if (lowerCasePayee.includes('alectra')) {
        return categories.find(category => category.label.toLowerCase().includes('hydro'))
    }

    /**** Internet ****/
    if (lowerCasePayee.includes('bell canada')) {
        return categories.find(category => category.label.toLowerCase().includes('internet'))
    }

    /**** Jill Netflix ****/
    if (lowerCasePayee.includes('netflix')) {
        return categories.find(category => category.label.toLowerCase().includes('netflix'))
    }

    /**** Nespresso ****/
    if (lowerCasePayee.includes('nespresso')) {
        return categories.find(category => category.label.toLowerCase().includes('nespresso'))
    }

    /**** Nick OSAP (NSLSC) ****/
    if (lowerCasePayee.includes('nslsc')) {
        return categories.find(category => category.label.toLowerCase().includes('osap'))
    }

    /**** Phone Bills ****/
    if (isNicksAccount && lowerCasePayee.includes('koodo')) {
        return categories.find(category => category.label.toLowerCase().includes('nick phone'))
    }
    if (isJillsAccount && lowerCasePayee.includes('koodo')) {
        return categories.find(category => category.label.toLowerCase().includes('jill phone'))
    }

    /**** Preventative Health ****/
    if (lowerCasePayee.includes('osteopathy') ||
        lowerCasePayee.includes('wellness collectiv') ||
        lowerCasePayee.includes('wellness inc')
    ) {
        return categories.find(category => category.label.toLowerCase().includes('preventative'))
    }

    /**** Retirement ****/
    if (lowerCasePayee.includes('questrade')) {
        return categories.find(category => category.label.toLowerCase().includes('nick retirement'))
    }
    if (lowerCasePayee.includes('mutual funds')) {
        return categories.find(category => category.label.toLowerCase().includes('jill retirement'))
    }
    
    /**** Salary ****/
    if (lowerCasePayee.includes('vehikl')) {
        return categories.find(category => category.label.toLowerCase().includes('nick salary'))
    }
    if (lowerCasePayee.includes('mcmaster univ - payroll deposit')) {
        return categories.find(category => category.label.toLowerCase().includes('jill salary'))
    }

    /**** Sobi ****/
    if (lowerCasePayee.includes('sobi')) {
        return categories.find(category => category.label.toLowerCase().includes('sobi'))
    }

    /**** Spotify ****/
    if (lowerCasePayee.includes('spotify')) {
        return categories.find(category => category.label.toLowerCase().includes('spotify'))
    }

    /**** Sweat App ****/
    if (lowerCasePayee.includes('sweat')) {
        return categories.find(category => category.label.toLowerCase().includes('sweat'))
    }

    /**** Transportation (bus/train/rental car/Uber) ****/
    if (lowerCasePayee.includes('uber') ||
        lowerCasePayee.includes('shell') ||
        lowerCasePayee.includes('presto') ||
        lowerCasePayee.includes('esso')
    ) {
        return categories.find(category => category.label.toLowerCase().includes('transportation'))
    }

    /**** Website Hosting Fees ****/
    if (lowerCasePayee.includes('digital ocean') || lowerCasePayee.includes('hostpapa')) {
        return categories.find(category => category.label.toLowerCase().includes('website hosting'))
    }

    return undefined
}