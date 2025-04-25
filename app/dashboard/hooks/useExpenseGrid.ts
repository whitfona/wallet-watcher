import {useMemo, useState} from 'react'
import {
    themeBalham,
    colorSchemeLightCold,
    type CellValueChangedEvent,
    type ValueFormatterParams,
    type RowSelectedEvent,
} from 'ag-grid-community'
import {type AgGridReactProps} from 'ag-grid-react'
import type {ExpenseRecord, SelectInterface} from '@/types/common'
import {formatCurrency, formatDate} from '@/utils/helpers'
import {supabase} from '@/utils/supabase'

type UseExpenseGridProps = {
    accounts: SelectInterface[]
    categories: SelectInterface[]
    payees: SelectInterface[]
    fetchExpenses: (month: number, year: number) => Promise<void>
    month: number
    year: number
    toast: {
        error: (message: string) => void
        success: (message: string) => void
    }
}

type ExpenseGridConfig = {
    theme: any
    colDefs: AgGridReactProps['columnDefs']
    defaultColDef: AgGridReactProps['defaultColDef']
    handleCellValueChange: (event: CellValueChangedEvent) => Promise<void>
    onRowSelected: (event: RowSelectedEvent) => void
    showDeleteButton: boolean
    setShowDeleteButton: (show: boolean) => void
}

export const useExpenseGrid = (
    {
        accounts,
        categories,
        payees,
        fetchExpenses,
        month,
        year,
        toast
    }: UseExpenseGridProps): ExpenseGridConfig => {
    const [showDeleteButton, setShowDeleteButton] = useState(false)
    const theme = themeBalham.withPart(colorSchemeLightCold)

    // Column definitions for AG Grid
    const colDefs = useMemo<AgGridReactProps['columnDefs']>(() => [
        {
            field: 'date',
            cellDataType: 'dateString',
            valueFormatter: (params: ValueFormatterParams) => formatDate(params.value)
        },
        {
            field: 'account',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: accounts.map((account) => account.label)
            },
        },
        {
            field: 'payee',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: payees.map((payee) => payee.label)
            },
        },
        {
            field: 'category',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: categories.map((category) => category.label)
            },
        },
        {field: 'memo'},
        {
            field: 'outflow',
            cellDataType: 'number',
            valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value)
        },
        {
            field: 'inflow',
            cellDataType: 'number',
            valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value)
        },
    ], [accounts, categories, payees])

    // Default column definition
    const defaultColDef = useMemo(() => ({
        filter: true,
        editable: true,
    }), [])

    // Handle cell value changes
    const handleCellValueChange = async (event: CellValueChangedEvent) => {
        const expenseId = event.data.id
        const field = event.colDef.field
        let newValue = event.newValue

        if (!expenseId || !field || !newValue) {
            return
        }

        try {
            // Map the field names to match the database columns
            const dbFieldMap: Record<string, string> = {
                account: 'account_id',
                category: 'category_id',
                payee: 'payee_id'
            }

            const dbField = dbFieldMap[field] || field

            // Convert the value to the correct type if needed
            if (field === 'account') {
                newValue = accounts.find((account) => account.label === newValue)?.value ?? null
            } else if (field === 'category') {
                newValue = categories.find((category) => category.label === newValue)?.value ?? null
            } else if (field === 'payee') {
                newValue = payees.find((payee) => payee.label === newValue)?.value ?? null
            }

            const {error} = await supabase
                .from('expenses')
                .update({[dbField]: newValue})
                .eq('id', expenseId)

            if (error) {
                toast.error('Failed to update expense')
                return
            }

            await fetchExpenses(month, year)
            toast.success('Expense updated successfully')
        } catch (error) {
            console.error('Error updating expense:', error)
            toast.error('An unexpected error occurred')
        }
    }

    const onRowSelected = (event: RowSelectedEvent) => {
        const selectedRows = event.api.getSelectedRows() as ExpenseRecord[]
        setShowDeleteButton(selectedRows ? selectedRows.length > 0 : false)
    }

    return {
        theme,
        colDefs,
        defaultColDef,
        handleCellValueChange,
        onRowSelected,
        showDeleteButton,
        setShowDeleteButton,
    }
}
