import {
    AllCommunityModule,
    ModuleRegistry,
    themeBalham,
    colorSchemeLightCold,
    type CellValueChangedEvent
} from 'ag-grid-community'
import {AgGridReact, type AgGridReactProps} from 'ag-grid-react'
import React, {type FormEvent, useEffect, useMemo, useState} from 'react'
import {FaPlusCircle, FaRegSave} from 'react-icons/fa'
import {fakeAccounts, fakeCategories, fakeExpenses, fakePayees} from '~/fake-data'
import type {ExpenseRecord, ExpenseFormData, SelectInterface} from '~/types/common'
import {TbCancel} from 'react-icons/tb'
import Select, {type SingleValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'

export function Index() {
    ModuleRegistry.registerModules([AllCommunityModule])
    const theme = themeBalham.withPart(colorSchemeLightCold)

    useEffect(() => {
        const mappedAccounts: SelectInterface[] = fakeAccounts.map((account) => ({
            value: account.id!,
            label: account.name,
        }))
        setAccounts(mappedAccounts)
        const mappedCategories: SelectInterface[] = fakeCategories.map((category) => ({
            value: category.id!,
            label: category.name,
        }))
        setCategories(mappedCategories)
        const mappedPayees: SelectInterface[] = fakePayees.map((payee) => ({
            value: payee.id!,
            label: payee.name,
        }))
        setPayees(mappedPayees)
        setRowData(fakeExpenses)
    }, [])
    const [accounts, setAccounts] = useState<SelectInterface[]>([])
    const [categories, setCategories] = useState<SelectInterface[]>([])
    const [payees, setPayees] = useState<SelectInterface[]>([])

    const [rowData, setRowData] = useState<ExpenseRecord[]>([])

    const [colDefs, setColDefs] = useState<AgGridReactProps['columnDefs']>([
        {
            field: 'date',
            cellDataType: 'dateString',
            valueFormatter: (params: any) => formatDate(params.value)
        },
        {
            field: 'account',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: fakeAccounts.map((account) => (account.name))
            },
        },
        {
            field: 'payee',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: fakePayees.map((payee) => (payee.name))
            },
        },
        {
            field: 'category',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: fakeCategories.map((category) => (category.name))
            },
        },
        {field: 'memo'},
        {
            field: 'outflow',
            cellDataType: 'number',
            valueFormatter: (params: any) => formatCurrency(params.value)
        },
        {
            field: 'inflow',
            cellDataType: 'number',
            valueFormatter: (params: any) => formatCurrency(params.value)
        },
    ])

    const defaultColDef = useMemo(() => ({
        filter: true,
        editable: true, // TODO: Handle these changes
    }), [])

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

    const cancelAddExpense = () => {
        setShowAddForm(false)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target

        const parsedValue = parseValue(value, type)

        setNewExpense(prevExpense => ({
            ...prevExpense,
            [name]: parsedValue
        }))
    }

    const handleSelectChange = (name: string, event: SingleValue<SelectInterface> | {
        value: string | number;
        label: string | number | undefined;
    }) => {
        if (!event) {
            return
        }

        setNewExpense(prevExpense => ({
            ...prevExpense,
            [name]: event.value
        }))
    }

    const handleCellValueChange = (event: CellValueChangedEvent) => {
        const expenseId = event.data.id
        const field = event.colDef.field
        let newValue = event.newValue

        if (!expenseId || !field || !newValue) {
            return
        }

        if (field === 'account') {
            newValue = accounts.find((account) => account.label === newValue)?.value ?? null
        }

        if (field === 'category') {

            newValue = categories.find((category) => category.label === newValue)?.value ?? null
        }

        if (field === 'payee') {
            newValue = payees.find((payee) => payee.label === newValue)?.value ?? null
        }

        // send to db with expenseId, field and newValue
        // pull fresh
    }

    const parseValue = (value: string | number | null, type: string) => {
        let parsedValue: number | string | null
        if (type === 'number' || type === 'select-one') {
            if (value === '') {
                parsedValue = null
            } else {
                parsedValue = value ? Number(value) : null
            }
        } else {
            parsedValue = value ?? null
        }
        return parsedValue
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (missingRequiredFields(newExpense)) {
            // TODO: add validation message or toast?
            console.log('error')
            return
        }

        // send to db
        // pull fresh data from the db
        console.log('newExpense', newExpense)
        setRowData([...rowData, newExpense])
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

    const missingRequiredFields = (expense: ExpenseFormData) => {
        return !expense.date || !expense.account || !expense.payee || (!expense.inflow && !expense.outflow)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-CA')
    }
    const formatCurrency = (currency: number | null) => {
        if (!currency) {
            return ''
        }
        return new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD'}).format(currency)
    }

    return (
        <main className="pt-8 pb-4">
            <header>
                <h1 className="text-center text-2xl">WalletWatcher</h1>
            </header>
            <div className="flex flex-row gap-4 border-t border-gray-300 p-4 mt-8">
                <div>
                    <p className="text-green-600 text-xl">{formatCurrency(inflowsTotal)}</p>
                    <p className="text-xs text-gray-500">Inflows</p>
                </div>
                <p>-</p>
                <div>
                    <p className="text-xl">{formatCurrency(outflowsTotal)}</p>
                    <p className="text-xs text-gray-500">Outflows</p>
                </div>
                <p>=</p>
                <div>
                    <p className={`${negativeMonthlyTotal ? 'text-red-600' : 'text-green-600'} text-xl`}>{formatCurrency(inflowsTotal - outflowsTotal)}</p>
                    <p className="text-xs text-gray-500">Monthly Total</p>
                </div>
            </div>
            <div className="flex flex-row gap-4 border-t border-gray-300 py-2 px-4 text-sm">
                <button className="flex items-center gap-1 text-blue-700 cursor-pointer hover:text-blue-500"
                        onClick={() => setShowAddForm(true)}>
                    <FaPlusCircle className="inline-block"/>
                    Add Transaction
                </button>
                <div className="flex items-center gap-1 text-blue-700 cursor-pointer hover:text-blue-500">
                    <FaRegSave className="inline-block"/>
                    File Import
                </div>
            </div>
            {showAddForm && <form className="flex flex-row flex-wrap gap-2 mb-2 px-4" onSubmit={handleSubmit}>
                <input className="border border-gray-400 p-2 text-xs"
                       type="date"
                       value={newExpense.date}
                       name="date"
                       onChange={handleChange}
                />
                <Select
                    placeholder="Enter account..."
                    options={accounts}
                    value={accounts.find(account => account.value === newExpense.account) || null}
                    onChange={(event) => handleSelectChange('account', event)}
                    name="account"
                    className="text-xs w-[149px]"
                    styles={{
                        menu: base => ({...base, zIndex: 10})
                    }}
                />
                <CreatableSelect
                    placeholder="Enter payee..."
                    options={payees}
                    value={newExpense.payee ? {
                        value: newExpense.payee,
                        label: Number.isInteger(newExpense.payee) ? payees.find(payee => payee.value === newExpense.payee)?.label : newExpense.payee,
                    } : null}
                    onChange={(event) => handleSelectChange('payee', event)}
                    name="payee"
                    className="text-xs w-[149px]"
                    styles={{
                        menu: base => ({...base, zIndex: 10})
                    }}
                />
                <Select
                    placeholder="Enter category..."
                    options={categories}
                    value={categories.find(category => category.value === newExpense.category) || null}
                    onChange={(event) => handleSelectChange('category', event)}
                    name="category"
                    className="text-xs w-[153px]"
                    styles={{
                        menu: base => ({...base, zIndex: 10})
                    }}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter memo..."
                       type="text"
                       name="memo"
                       value={newExpense.memo}
                       onChange={handleChange}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter outflow..."
                       type="number"
                       name="outflow"
                       value={newExpense.outflow ?? ''}
                       onChange={handleChange}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter inflow..."
                       type="number"
                       name="inflow"
                       value={newExpense.inflow ?? ''}
                       onChange={handleChange}
                />
                <button className="cursor-pointer" type="submit">
                    <FaPlusCircle/>
                </button>
                <button className="cursor-pointer" type="button" onClick={cancelAddExpense}>
                    <TbCancel/>
                </button>
            </form>}
            <div>
                <div>
                    <AgGridReact
                        autoSizeStrategy={{
                            type: 'fitGridWidth'
                        }}
                        domLayout="autoHeight"
                        rowData={rowData}
                        columnDefs={colDefs}
                        theme={theme}
                        defaultColDef={defaultColDef}
                        onCellValueChanged={handleCellValueChange}
                    />
                </div>
            </div>
        </main>
    )
}
