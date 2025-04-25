import {
    AllCommunityModule,
    ModuleRegistry,
} from 'ag-grid-community'
import {AgGridReact} from 'ag-grid-react'
import {type ChangeEvent, type FormEvent, useEffect, useRef, useState} from 'react'
import {FaRegSave} from 'react-icons/fa'
import type {ExpenseRecord, ExpenseFormData, SelectInterface} from '@/types/common'
import {FaRegTrashCan} from 'react-icons/fa6'
import {DialogConfirmButton} from '@/components/DialogConfirmButton'
import {IoMdAddCircleOutline} from 'react-icons/io'
import {DialogCalendar} from '@/components/DialogCalendar'
import {read, utils} from 'xlsx'
import {AddExpenseForm} from '@/dashboard/components/AddExpenseForm'
import {BalanceSummary} from '@/components/BalanceSummary'
import {formatDateForTimestamptz} from '@/utils/helpers'
import {supabase} from '@/utils/supabase'
import {useToast} from '@/components/Toast'
import {useDuplicateExpenseDialog} from '@/components/DuplicateExpenseDialog'
import {useExpenseGrid} from '@/dashboard/hooks/useExpenseGrid'

export function Index() {
    ModuleRegistry.registerModules([AllCommunityModule])
    const agGridRef = useRef<AgGridReact<ExpenseRecord>>(null)
    const toast = useToast()
    const {showDuplicateDialog} = useDuplicateExpenseDialog()

    const [accounts, setAccounts] = useState<SelectInterface[]>([])
    const [categories, setCategories] = useState<SelectInterface[]>([])
    const [payees, setPayees] = useState<SelectInterface[]>([])
    const [rowData, setRowData] = useState<ExpenseRecord[]>([])
    const [, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
                try {
                    setIsLoading(true)
                    const [accountsResponse, categoriesResponse, payeesResponse] = await Promise.all([
                        supabase.from('accounts_view').select('*').order('name', {ascending: true}),
                        supabase.from('categories_view').select('*').order('name', {ascending: true}),
                        supabase.from('payees_view').select('*').order('name', {ascending: true})
                    ])

                    if (accountsResponse.error) {
                        toast.error('Failed to load accounts')
                        return
                    }
                    if (categoriesResponse.error) {
                        toast.error('Failed to load categories')
                        return
                    }
                    if (payeesResponse.error) {
                        toast.error('Failed to load payees')
                        return
                    }

                    const mappedAccounts: SelectInterface[] = accountsResponse.data.map((account) => ({
                        value: account.id,
                        label: account.name,
                    }))
                    setAccounts(mappedAccounts)

                    const mappedCategories: SelectInterface[] = categoriesResponse.data.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))
                    setCategories(mappedCategories)

                    const mappedPayees: SelectInterface[] = payeesResponse.data.map((payee) => ({
                        value: payee.id,
                        label: payee.name,
                    }))
                    setPayees(mappedPayees)

                    await fetchExpenses(month, year)
                } catch (error) {
                    console.error('Error fetching data:', error)
                    toast.error('Failed to load data')
                } finally {
                    setIsLoading(false)
                }
            }

        ;(() => fetchData())()
    }, [])

    const fetchExpenses = async (selectedMonth: number, selectedYear: number): Promise<void> => {
        try {
            const endMonth = selectedMonth === 12 ? 1 : selectedMonth + 1
            const endYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear

            const {data: expensesData, error: fetchError} = await supabase
                .from('expenses_view')
                .select('*')
                .gte('date', `${selectedYear}-${selectedMonth}-01`)
                .lte('date', `${endYear}-${endMonth}-01`)
                .order('date', {ascending: false})

            if (fetchError) {
                toast.error('Failed to refresh expenses')
                return
            }

            setRowData(expensesData)
        } catch (error) {
            console.error('Error fetching expenses:', error)
            toast.error('An unexpected error occurred')
        }
    }

    const fileUploadRef = useRef<HTMLInputElement>(null)
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [showAddForm, setShowAddForm] = useState(false)
    // const [showDeleteButton, setShowDeleteButton] = useState(false)
    const [newExpense, setNewExpense] = useState<ExpenseFormData>({
        id: null,
        date: '',
        account: null,
        payee: null,
        category: null,
        memo: '',
        inflow: null,
        outflow: null
    })
    const inflowsTotal = rowData.reduce((acc, currentValue) => acc + Number(currentValue.inflow), 0)
    const outflowsTotal = rowData.reduce((acc, currentValue) => acc + Number(currentValue.outflow), 0)
    const negativeMonthlyTotal = (inflowsTotal - outflowsTotal) < 0

    // Initialize grid configuration
    const {
        theme,
        colDefs,
        defaultColDef,
        handleCellValueChange,
        onRowSelected,
        showDeleteButton,
        setShowDeleteButton
    } = useExpenseGrid({
        accounts,
        categories,
        payees,
        fetchExpenses,
        month,
        year,
        toast
    })

    useEffect(() => {
        setShowDeleteButton(showDeleteButton)
    }, [showDeleteButton])

    const cancelAddExpense = () => {
        setShowAddForm(false)
        resetNewExpense()
    }

    const resetNewExpense = () => {
        setNewExpense({
            id: null,
            date: '',
            account: null,
            payee: null,
            category: null,
            memo: '',
            inflow: null,
            outflow: null
        })
    }

    const checkForDuplicateExpense = async (expense: {
        date: string,
        account: string | number | null,
        outflow: number | null,
        inflow: number | null
    }): Promise<ExpenseRecord | undefined> => {
        const {startTimestamp, endTimestamp} = formatDateForTimestamptz(expense.date)

        // Query database for potential duplicates
        const {data: existingExpenses, error} = await supabase
            .from('expenses')
            .select('*')
            .filter('date', 'gte', startTimestamp)
            .filter('date', 'lt', endTimestamp)
            .eq('account_id', expense.account)
            .or(`outflow.eq.${expense.outflow || 0},inflow.eq.${expense.inflow || 0}`)

        if (error) {
            toast.error('Error checking for duplicate expense')
            return
        }

        if (existingExpenses && existingExpenses.length > 0) {
            // Get the full expense details for the duplicate dialog
            const {data: expenseView} = await supabase
                .from('expenses_view')
                .select('*')
                .eq('id', existingExpenses[0].id)
                .single()

            return expenseView
        }

        return
    }

    const handleAddExpense = async (e: FormEvent) => {
        e.preventDefault()
        if (missingRequiredFields(newExpense)) {
            toast.error('Please fill in all required fields')
            return
        }

        const matchingExpense = await checkForDuplicateExpense(newExpense)
        if (matchingExpense) {
            setShowAddForm(false)
            showDuplicateDialog(
                {
                    ...newExpense,
                    id: -1, // here to appease typescript
                    account: accounts.find(account => account.value === newExpense.account)?.label ?? '',
                    payee: payees.find(payee => payee.value === newExpense.payee)?.label ?? '',
                    category: categories.find(category => category.value === newExpense.category)?.label ?? '',
                },
                matchingExpense,
                async () => {
                    await addExpenseToDatabase(newExpense)
                },
                () => resetNewExpense()
            )
            return
        }

        await addExpenseToDatabase(newExpense)
    }

    const createPayeeIfNeeded = async (payeeName: string | number | null): Promise<number | null> => {
        // If payee is already an ID (number), return it
        if (typeof payeeName !== 'string' || !payeeName) {
            return payeeName as number | null
        }

        // Check if payee already exists
        const existingPayee = payees.find(payee => payee.label.toLowerCase() === payeeName.toLowerCase())
        if (existingPayee) {
            return existingPayee.value as number
        }

        // Create new payee
        const {data: newPayee, error: payeeError} = await supabase
            .from('payees')
            .insert([{name: payeeName}])
            .select()
            .single()

        if (payeeError) {
            toast.error('Failed to create new payee')
            return null
        }

        return newPayee.id
    }

    const refreshPayees = async () => {
        const payeesResponse = await supabase
            .from('payees_view')
            .select('*')
            .order('name', {ascending: true})

        if (payeesResponse.error) {
            toast.error('Failed to refresh payees')
            return false
        }

        const mappedPayees: SelectInterface[] = payeesResponse.data.map((payee) => ({
            value: payee.id,
            label: payee.name,
        }))
        setPayees(mappedPayees)
        return true
    }

    const addExpenseToDatabase = async (expense: ExpenseFormData) => {
        try {
            // If payee is a string (new payee), create it first
            const payeeId = await createPayeeIfNeeded(expense.payee)
            if (payeeId === null && expense.payee !== null) {
                return
            }

            const {error} = await supabase
                .from('expenses')
                .insert([{
                    date: expense.date,
                    account_id: expense.account,
                    payee_id: payeeId,
                    category_id: expense.category,
                    memo: expense.memo,
                    outflow: expense.outflow,
                    inflow: expense.inflow
                }])

            if (error) {
                toast.error('Failed to add expense')
                return
            }

            await refreshPayees()
            await fetchExpenses(month, year)

            toast.success('Expense added successfully')
            setShowAddForm(false)
            resetNewExpense()
        } catch (error) {
            console.error('Error adding expense:', error)
            toast.error('An unexpected error occurred')
        }
    }

    const deleteExpenses = async () => {
        const selectedExpenses = agGridRef.current?.api?.getSelectedRows()

        if (!selectedExpenses || selectedExpenses.length === 0) {
            return
        }

        const expenseIdsToDelete = selectedExpenses.map(expense => expense.id)

        try {
            const {error} = await supabase
                .from('expenses')
                .delete()
                .in('id', expenseIdsToDelete)

            if (error) {
                toast.error('Failed to delete expenses')
                return
            }

            await fetchExpenses(month, year)
            toast.success('Expenses deleted successfully')
        } catch (error) {
            console.error('Error deleting expenses:', error)
            toast.error('An unexpected error occurred')
        }
    }

    const missingRequiredFields = (expense: ExpenseFormData) => {
        return !expense.date || !expense.account || !expense.payee || (!expense.inflow && !expense.outflow)
    }

    const onDateChange = async (month: number, year: number) => {
        setMonth(month)
        setYear(year)

        await fetchExpenses(month, year)
    }

    const handleFileImportClick = () => {
        fileUploadRef.current?.click()
    }

    interface ImportedExpense {
        date: string;
        account: string | null;
        payee: string | null;
        category: string | null;
        memo: string;
        outflow: number | null;
        inflow: number | null;
    }

    const formatImportedExpenseForDialog = (
        item: ImportedExpense,
        formattedDate: string,
        account: SelectInterface
    ): ExpenseRecord => {
        return {
            id: -1, // Temporary id for dialog
            date: formattedDate,
            account: account.label,
            payee: item.payee || '',
            category: item.category || '',
            memo: item.memo || '',
            outflow: item.outflow,
            inflow: item.inflow
        }
    }

    const insertExpense = async (
        formattedDate: string,
        accountId: number,
        payeeId: number | null,
        categoryId: number | null,
        memo: string,
        outflow: number | null,
        inflow: number | null
    ): Promise<boolean> => {
        const {error} = await supabase
            .from('expenses')
            .insert([{
                date: formattedDate,
                account_id: accountId,
                payee_id: payeeId,
                category_id: categoryId,
                memo: memo || '',
                outflow: outflow || null,
                inflow: inflow || null
            }])

        return !error
    }

    const displayImportStatus = (
        successCount: number,
        duplicateCount: number,
        skippedCount: number,
        errorCount: number
    ): void => {
        if (successCount > 0) {
            let message = `${successCount} expenses imported successfully.`
            if (skippedCount > 0 || errorCount > 0) {
                message += ` ${skippedCount} skipped.`
                if (errorCount > 0) {
                    message += ` ${errorCount} failed due to errors.`
                }
            }
            toast.success(message)
        } else if (duplicateCount > 0 && successCount === 0) {
            let message = `No new expenses imported. All were duplicates or skipped.`
            if (errorCount > 0) {
                message += ` ${errorCount} failed due to errors.`
            }
            toast.info(message)
        } else {
            let message = 'Failed to import expenses'
            if (errorCount > 0) {
                message += ` (${errorCount} errors encountered)`
            }
            toast.error(message)
        }
    }

    const processExpense = async (
        item: ImportedExpense,
        counters: {
            successCount: number,
            duplicateCount: number,
            skippedCount: number,
            errorCount: number
        },
        processNextFunction: (index: number) => Promise<void>,
        currentIndex: number
    ): Promise<void> => {
        try {
            const account = accounts.find((acc) => acc.label.toLowerCase() === item.account?.toLowerCase())
            if (!account?.value) {
                counters.skippedCount++
                await processNextFunction(currentIndex + 1)
                return
            }

            // Format data for duplicate checking
            const formattedDate = new Date(item.date).toISOString()
            const expenseToCheck = {
                date: formattedDate,
                account: account.value,
                outflow: item.outflow,
                inflow: item.inflow
            }

            const duplicate = await checkForDuplicateExpense(expenseToCheck)
            const category = categories.find((cat) => item.category && cat.label.includes(item.category))

            if (duplicate) {
                counters.duplicateCount++
                const newExpenseFormatted = formatImportedExpenseForDialog(item, formattedDate, account)

                showDuplicateDialog(
                    newExpenseFormatted,
                    duplicate,
                    async () => {
                        const payeeId = await createPayeeIfNeeded(item.payee)
                        const success = await insertExpense(
                            formattedDate,
                            account.value as number,
                            payeeId,
                            category?.value || null,
                            item.memo || '',
                            item.outflow,
                            item.inflow
                        )

                        if (success) {
                            counters.successCount++
                            counters.duplicateCount--  // This is no longer a duplicate since we added it
                        } else {
                            counters.errorCount++
                        }

                        await processNextFunction(currentIndex + 1)
                    },
                    () => {
                        processNextFunction(currentIndex + 1)
                    }
                )
            } else {
                const payeeId = await createPayeeIfNeeded(item.payee)
                const success = await insertExpense(
                    formattedDate,
                    account.value as number,
                    payeeId,
                    category?.value || null,
                    item.memo || '',
                    item.outflow,
                    item.inflow
                )

                if (success) {
                    counters.successCount++
                } else {
                    counters.errorCount++
                }

                await processNextFunction(currentIndex + 1)
            }
        } catch (error) {
            console.error('Error processing expense:', error instanceof Error ? error.message : error)
            counters.errorCount++
            await processNextFunction(currentIndex + 1)
        }
    }

    const parseExcelFile = async (fileContent: string | ArrayBuffer): Promise<ImportedExpense[]> => {
        const workbook = read(fileContent, {type: 'binary'})
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const header = ['date', 'account', 'payee', 'category', 'memo', 'outflow', 'inflow']
        const sheetData: ImportedExpense[] = utils.sheet_to_json(sheet, {header: header})

        // Filter valid expenses (accounts must exist)
        return sheetData.slice(1).filter(item => {
            const account = accounts.find((acc) => acc.label.toLowerCase() === item.account?.toLowerCase())
            return !!account?.value
        })
    }

    const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target || !e.target.files) {
            return
        }
        const file = e.target.files[0]
        const reader = new FileReader()

        reader.onload = async (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) {
                return
            }

            try {
                const validExpenses = await parseExcelFile(event.target.result)

                if (validExpenses.length === 0) {
                    toast.error('No valid expenses found in the file')
                    return
                }

                toast.info(`Processing ${validExpenses.length} expenses...`)

                // Counters for tracking import progress
                const counters = {
                    successCount: 0,
                    duplicateCount: 0,
                    skippedCount: 0,
                    errorCount: 0
                }

                // Define the recursive processing function
                const processNextExpense = async (index: number): Promise<void> => {
                    // All expenses processed
                    if (index >= validExpenses.length) {
                        await refreshPayees()
                        await fetchExpenses(month, year)
                        displayImportStatus(
                            counters.successCount,
                            counters.duplicateCount,
                            counters.skippedCount,
                            counters.errorCount
                        )
                        if (fileUploadRef.current) {
                            fileUploadRef.current.value = ''
                        }
                        return
                    }

                    // Process the current expense
                    await processExpense(
                        validExpenses[index],
                        counters,
                        processNextExpense,
                        index
                    )
                }

                // Start processing the first expense
                await processNextExpense(0)

            } catch (error) {
                console.error('Error importing expenses:', error)
                toast.error('Failed to import expenses')
                if (fileUploadRef.current) {
                    fileUploadRef.current.value = ''
                }
            }
        }

        reader.readAsArrayBuffer(file)
    }

    return (
        <main className="pt-8 pb-4">
            <header>
                <h1 className="text-center text-2xl">WalletWatcher</h1>
                <DialogCalendar
                    className="mt-4"
                    initialMonth={month}
                    initialYear={year}
                    onDateChange={onDateChange}
                />
            </header>
            <BalanceSummary
                className="p-4 mt-8 border-t border-gray-300"
                inflowsTotal={inflowsTotal}
                outflowsTotal={outflowsTotal}
                negativeMonthlyTotal={negativeMonthlyTotal}
            />
            <div className="flex justify-between border-t border-gray-300 py-2 px-4 text-sm">
                <div className="flex flex-row gap-4">
                    <button className="flex items-center gap-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                            onClick={() => setShowAddForm(true)}>
                        <IoMdAddCircleOutline className="inline-block w-[16px] h-[16px]"/>
                        Add Transaction
                    </button>
                    <button
                        className="relative flex items-center gap-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                        title="['date', 'account', 'payee', 'category', 'memo', 'outflow', 'inflow']"
                        onClick={handleFileImportClick}
                    >
                        <FaRegSave className="inline-block w-[16px] h-[16px]"/>
                        File Import
                        <input
                            ref={fileUploadRef}
                            type="file"
                            onChange={onFileChange}
                            className="hidden"
                            aria-label="File Import"
                        />
                    </button>
                </div>
                {showDeleteButton &&
                    <DialogConfirmButton
                        triggerText={
                            <span
                                className="flex items-center gap-1 text-red-300 hover:text-red-500"
                            >
                                <FaRegTrashCan className="inline-block w-[16px] h-[16px]"/>
                                Delete Expenses
                            </span>
                        }
                        onAccept={deleteExpenses}
                    />}
            </div>
            {showAddForm &&
                <AddExpenseForm
                    newExpense={newExpense}
                    setNewExpense={setNewExpense}
                    accounts={accounts}
                    categories={categories}
                    payees={payees}
                    handleSubmit={handleAddExpense}
                    handleCancel={cancelAddExpense}
                />}
            <div>
                <div>
                    <AgGridReact
                        ref={agGridRef}
                        autoSizeStrategy={{
                            type: 'fitGridWidth'
                        }}
                        domLayout="autoHeight"
                        rowData={rowData}
                        columnDefs={colDefs}
                        theme={theme}
                        defaultColDef={defaultColDef}
                        onCellValueChanged={handleCellValueChange}
                        rowSelection={{mode: 'multiRow'}}
                        onRowSelected={onRowSelected}
                    />
                </div>
            </div>
        </main>
    )
}
