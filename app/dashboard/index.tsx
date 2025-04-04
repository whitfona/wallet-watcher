import {AllCommunityModule, ModuleRegistry, themeBalham, colorSchemeLightCold} from 'ag-grid-community'
import {AgGridReact, type AgGridReactProps} from 'ag-grid-react'
import React, {type FormEvent, useEffect, useMemo, useState} from 'react'
import {FaPlusCircle, FaRegSave} from 'react-icons/fa'
import {fakeCategories, fakeExpenses} from '~/fake-data'
import type {Category, ExpenseRecord, ExpenseFormData} from '~/types/common'
import {TbCancel} from 'react-icons/tb'

export function Index() {
    ModuleRegistry.registerModules([AllCommunityModule])
    const theme = themeBalham.withPart(colorSchemeLightCold)

    useEffect(() => {
        setCategories(fakeCategories)
        setRowData(fakeExpenses)
    }, [])
    const [categories, setCategories] = useState<Category[]>([])

    const [rowData, setRowData] = useState<ExpenseRecord[]>([])

    const [colDefs, setColDefs] = useState<AgGridReactProps['columnDefs']>([
        {
            field: 'date', valueFormatter: (params: any) => formatDate(params.value)
        },
        {field: 'account'},
        {field: 'payee'},
        {field: 'category'},
        {field: 'memo'},
        {field: 'outflow', valueFormatter: (params: any) => formatCurrency(params.value)},
        {field: 'inflow', valueFormatter: (params: any) => formatCurrency(params.value)},
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
            payee: '',
            category: null,
            memo: '',
            inflow: null,
            outflow: null
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target

        setNewExpense(prevExpense => ({
            ...prevExpense,
            [name]: type === 'number' ? (value ? Number(value) : null) : value
        }))
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
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter account..."
                       type="text"
                       name="account"
                       value={newExpense.account}
                       onChange={handleChange}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter payee..."
                       type="text"
                       name="payee"
                       value={newExpense.payee}
                       onChange={handleChange}
                />
                <select className="border border-gray-400 p-2 text-xs">
                    <option value="null">Enter Category...</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter memo..."
                       type="text"
                       name="memo"
                       value={newExpense.memo}
                       onChange={handleChange}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter outfow..."
                       type="number"
                       name="outflow"
                       value={newExpense.outflow ?? ''}
                       onChange={handleChange}
                />
                <input className="border border-gray-400 p-2 text-xs"
                       placeholder="Enter infow..."
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
                        onCellValueChanged={event => console.log(`New Cell Value: ${event.value}`)}
                    />
                </div>
            </div>
        </main>
    )
}
