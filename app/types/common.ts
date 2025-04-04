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

// shape from the backend
export interface ExpenseRecord {
    id: number,
    date: string,
    account: string,
    payee: string,
    category: string,
    memo: string,
    outflow: number | null,
    inflow: number | null
}

//shape when creating new or editing
export interface ExpenseFormData {
    id: number | null,
    date: string,
    account: number | null,
    payee: number | string | null,
    category: number | null,
    memo: string,
    outflow: number | null,
    inflow: number | null
}