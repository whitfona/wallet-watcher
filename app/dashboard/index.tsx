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
import {AddExpenseForm} from '@/dashboard/components/AddExpenseForm'
import {BalanceSummary} from '@/components/BalanceSummary'
import {formatDateForTimestamptz} from '@/utils/helpers'
import {supabase} from '@/utils/supabase'
import {useToast} from '@/components/Toast'
import {useDialogDuplicateExpense} from '@/components/DialogDuplicateExpense'
import {useExpenseGrid} from '@/dashboard/hooks/useExpenseGrid'
import {handleFileChange} from '@/dashboard/services/fileImportService'

export function Index() {
    ModuleRegistry.registerModules([AllCommunityModule])
    const agGridRef = useRef<AgGridReact<ExpenseRecord>>(null)
    const toast = useToast()
    const {showDialogDuplicationExpense} = useDialogDuplicateExpense()

    const [accounts, setAccounts] = useState<SelectInterface[]>([])
    const [categories, setCategories] = useState<SelectInterface[]>([])
    const [payees, setPayees] = useState<SelectInterface[]>([])
    const [rowData, setRowData] = useState<ExpenseRecord[]>([])
    const [, setIsLoading] = useState(true)

    useEffect(() => {
        ;(() => fetchData())()
    }, [])

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
            showDialogDuplicationExpense(
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

    const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        await handleFileChange(e, {
            accounts,
            categories,
            fileUploadRef,
            toast,
            month,
            year,
            refreshPayees,
            fetchExpenses,
            checkForDuplicateExpense,
            createPayeeIfNeeded,
            insertExpense,
            showDialogDuplicationExpense,
        })
    }

    return (
        <main className="pt-8 pb-4">
            <header>
                <h1 className="text-center text-2xl">WalletWatcher</h1>
                <DialogCalendar
                    className="mt-4 mb-10"
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
