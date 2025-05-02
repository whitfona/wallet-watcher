import type {Account, Category, ExpenseRecord, Payee} from '@/types/common'

export const fakeCategories: Category[] = [
    {
        id: 1,
        name: '☕️ Coffee/Teas'
    },
    {
        id: 2,
        name: '🛒 Groceries',
    },
    {
        id: 3,
        name: '🎬 Entertainment',
    },
    {
        id: 4,
        name: '🚗 Transportation',
    },
    {
        id: 5,
        name: '💰 Income',
    },
]

export const fakePayees: Payee[] = [
    {
        id: 1,
        name: 'Tim Hortons'
    },
    {
        id: 2,
        name: 'Fortinos',
    },
    {
        id: 3,
        name: 'Netflix',
    },
    {
        id: 4,
        name: 'Uber',
    },
    {
        id: 5,
        name: 'Acme Corp',
    },
]

export const fakeAccounts: Account[] = [
    {
        id: 1,
        name: 'Chequing'
    },
    {
        id: 2,
        name: 'Saving',
    },
    {
        id: 3,
        name: 'VISA'
    },
]

export const fakeExpenses: ExpenseRecord[] = [
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
        date: '2025-04-02T08:05:31.254Z',
        account: 'Chequing',
        payee: 'Direct Deposit - Acme Corp',
        category: '💰 Income',
        memo: 'Bi-weekly salary',
        outflow: null,
        inflow: 2150.75
    },
    {
        id: 3,
        date: '2025-04-01T09:23:14.782Z',
        account: 'Chequing',
        payee: 'Fortinos',
        category: '🛒 Groceries',
        memo: 'Weekly grocery shopping',
        outflow: 87.43,
        inflow: null
    },
    {
        id: 4,
        date: '2025-03-29T18:45:52.101Z',
        account: 'Saving',
        payee: 'Netflix',
        category: '🎬 Entertainment',
        memo: 'Monthly subscription',
        outflow: 15.99,
        inflow: null
    },
    {
        id: 5,
        date: '2025-03-31T14:12:09.471Z',
        account: 'Saving',
        payee: 'Uber',
        category: '🚗 Transportation',
        memo: 'Ride to downtown meeting',
        outflow: 24.50,
        inflow: null
    },
    {
        id: 6,
        date: '2025-04-16T08:05:31.254Z',
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
