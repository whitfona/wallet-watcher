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
    id: number
    date: string
    account: string
    payee: string
    category: string
    memo: string
    outflow: number | null
    inflow: number | null
}

//shape when creating new or editing
export interface ExpenseFormData {
    id: number | null
    date: string
    account: number | null
    payee: number | string | null
    category: number | null
    memo: string
    outflow: number | null
    inflow: number | null
}

export interface ImportedExpense {
    date: string;
    account: string | null;
    payee: string | null;
    category: string | null;
    memo: string;
    outflow: number | null;
    inflow: number | null;
}

export interface ImportCounters {
    successCount: number;
    duplicateCount: number;
    skippedCount: number;
    errorCount: number;
}

export interface SelectInterface {
    value: number
    label: string
}

export interface CategoryExpenseData {
    name: string,
    value: number,
    color: string
}

export interface MainCategoryData {
    name: string
    value: number
    color: string
    subcategories: {
        [key: string]: {
            inflow: number
            outflow: number
            net: number
        }
    }
}

export interface CategoryValues {
    inflow: number
    outflow: number
}

// shape from the backend
export interface CategoryExpenseRecord {
    category: string
    inflow: number | null
    outflow: number | null
}

//shape from the backend
export interface MonthlyCashflowRecord {
    month: string
    inflow: number
    outflow: number
}