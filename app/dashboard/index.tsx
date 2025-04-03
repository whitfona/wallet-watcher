import {AllCommunityModule, ModuleRegistry, themeBalham, colorSchemeLightCold} from 'ag-grid-community'
import {AgGridReact, type AgGridReactProps} from 'ag-grid-react'
import {useMemo, useState} from 'react'

export function Index() {
    ModuleRegistry.registerModules([AllCommunityModule])

    const theme = themeBalham.withPart(colorSchemeLightCold)

    const [rowData, setRowData] = useState(expenses)

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
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <header className="flex flex-col items-center gap-9">
                    <h1>WalletWatcher</h1>
                </header>
                <div className="w-full space-y-6 px-4">
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
            </div>
        </main>
    )
}

const expenses = [
    {
        id: 1,
        date: '2025-04-02T12:51:34.361Z',
        account: 'Chequing',
        payee: 'Tim Hortons',
        category: '☕️ Coffee/Teas',
        memo: 'Coffee at the airport',
        outflow: 3,
        inflow: null
    },
    {
        id: 2,
        date: '2025-04-01T09:23:14.782Z',
        account: 'Chequing',
        payee: 'Fortinos',
        category: '🛒 Groceries',
        memo: 'Weekly grocery shopping',
        outflow: 87.43,
        inflow: null
    },
    {
        id: 3,
        date: '2025-03-29T18:45:52.101Z',
        account: 'Saving',
        payee: 'Netflix',
        category: '🎬 Entertainment',
        memo: 'Monthly subscription',
        outflow: 15.99,
        inflow: null
    },
    {
        id: 4,
        date: '2025-03-31T14:12:09.471Z',
        account: 'Saving',
        payee: 'Uber',
        category: '🚗 Transportation',
        memo: 'Ride to downtown meeting',
        outflow: 24.50,
        inflow: null
    },
    {
        id: 5,
        date: '2025-04-02T08:05:31.254Z',
        account: 'Chequing',
        payee: 'Direct Deposit - Acme Corp',
        category: '💰 Income',
        memo: 'Bi-weekly salary',
        outflow: null,
        inflow: 2150.75
    },
]

// const expenses = [
//     {
//         id: 1,
//         date: '2025-04-02T12:51:34.361Z',
//         account: {
//             id: 1,
//             name: 'Chequing'
//         },
//         payee: {
//             id: 1,
//             name: 'Tim Hortons'
//         },
//         category: {
//             id: 1,
//             name: 'Coffee/Teas',
//             icon: '☕️'
//         },
//         memo: 'Coffee at the airport',
//         outflow: 3,
//         inflow: null
//     },
//     {
//         id: 2,
//         date: '2025-04-01T09:23:14.782Z',
//         account: {
//             id: 1,
//             name: 'Chequing'
//         },
//         payee: {
//             id: 3,
//             name: 'Fortinos'
//         },
//         category: {
//             id: 4,
//             name: 'Groceries',
//             icon: '🛒'
//         },
//         memo: 'Weekly grocery shopping',
//         outflow: 87.43,
//         inflow: null
//     },
//     {
//         id: 3,
//         date: '2025-03-29T18:45:52.101Z',
//         account: {
//             id: 2,
//             name: 'Saving'
//         },
//         payee: {
//             id: 7,
//             name: 'Netflix'
//         },
//         category: {
//             id: 9,
//             name: 'Entertainment',
//             icon: '🎬'
//         },
//         memo: 'Monthly subscription',
//         outflow: 15.99,
//         inflow: null
//     },
//     {
//         id: 4,
//         date: '2025-03-31T14:12:09.471Z',
//         account: {
//             id: 2,
//             name: 'Saving'
//         },
//         payee: {
//             id: 12,
//             name: 'Uber'
//         },
//         category: {
//             id: 5,
//             name: 'Transportation',
//             icon: '🚗'
//         },
//         memo: 'Ride to downtown meeting',
//         outflow: 24.50,
//         inflow: null
//     },
//     {
//         id: 5,
//         date: '2025-04-02T08:05:31.254Z',
//         account: {
//             id: 1,
//             name: 'Chequing'
//         },
//         payee: {
//             id: 9,
//             name: 'Direct Deposit - Acme Corp'
//         },
//         category: {
//             id: 2,
//             name: 'Income',
//             icon: '💰'
//         },
//         memo: 'Bi-weekly salary',
//         outflow: null,
//         inflow: 2150.75
//     },
// ]
