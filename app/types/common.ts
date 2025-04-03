export interface Category {
    id?: number
    name: string
}

export interface Payee {
    id?: number
    name: string
}

export interface Account {
    id?: number
    name: string
}

export interface Expense {
    id: number,
    date: string,
    account: string,
    payee: string,
    category: string,
    memo: string,
    outflow: number | null,
    inflow: number | null
}