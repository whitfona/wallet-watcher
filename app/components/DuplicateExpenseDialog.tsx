import React, {createContext, useCallback, useContext, useState} from 'react'
import {FiAlertCircle} from 'react-icons/fi'
import {formatCurrency, formatDate} from '@/utils/helpers'
import type {ExpenseFormData} from '@/types/common'

interface DuplicateExpenseContextType {
    showDuplicateDialog: (expense: ExpenseFormData, matchingExpense: ExpenseFormData, onAccept: () => void, onReject: () => void) => void
}

interface DuplicateExpenseDialogProps {
    children: React.ReactNode
}

interface DialogState {
    isOpen: boolean
    expense: ExpenseFormData | null
    matchingExpense: ExpenseFormData | null
    onAccept: (() => void) | null
    onReject: (() => void) | null
}

const DuplicateExpenseContext = createContext<DuplicateExpenseContextType | undefined>(undefined)

const renderExpenseDetails = (expense: ExpenseFormData, title: string) => (
    <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <h3 className="font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Date:</div>
            <div>{formatDate(expense.date)}</div>

            <div className="font-medium">Account:</div>
            <div>{expense.account}</div>

            {expense.payee && (
                <>
                    <div className="font-medium">Payee:</div>
                    <div>{expense.payee}</div>
                </>
            )}

            {expense.category && (
                <>
                    <div className="font-medium">Category:</div>
                    <div>{expense.category}</div>
                </>
            )}

            {expense.memo && (
                <>
                    <div className="font-medium">Memo:</div>
                    <div>{expense.memo}</div>
                </>
            )}

            {expense.inflow ? (
                <>
                    <div className="font-medium">Inflow:</div>
                    <div className="text-green-600">{formatCurrency(expense.inflow)}</div>
                </>
            ) : (
                <>
                    <div className="font-medium">Outflow:</div>
                    <div className="text-red-600">{formatCurrency(expense.outflow)}</div>
                </>
            )}
        </div>
    </div>
)

export const DuplicateExpenseProvider: React.FC<DuplicateExpenseDialogProps> = ({children}) => {
    const [dialogState, setDialogState] = useState<DialogState>({
        isOpen: false,
        expense: null,
        matchingExpense: null,
        onAccept: null,
        onReject: null
    })

    const showDuplicateDialog = useCallback((
        expense: ExpenseFormData,
        matchingExpense: ExpenseFormData,
        onAccept: () => void,
        onReject: () => void
    ) => {
        setDialogState({
            isOpen: true,
            expense,
            matchingExpense,
            onAccept,
            onReject
        })
    }, [])

    const closeDialog = useCallback(() => {
        setDialogState(prev => ({
            ...prev,
            isOpen: false
        }))
    }, [])

    const handleAccept = useCallback(() => {
        dialogState.onAccept?.()
        closeDialog()
    }, [dialogState.onAccept, closeDialog])

    const handleReject = useCallback(() => {
        dialogState.onReject?.()
        closeDialog()
    }, [dialogState.onReject, closeDialog])

    return (
        <DuplicateExpenseContext.Provider value={{showDuplicateDialog}}>
            {children}
            {dialogState.isOpen && dialogState.expense && dialogState.matchingExpense && (
                <dialog
                    open
                    className="fixed inset-0 z-50 m-0 p-0 h-full w-full bg-transparent"
                >
                    <div className="fixed inset-0 bg-black/60" onClick={handleReject} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl">
                        <div className="flex items-center gap-2 border-b border-gray-200 py-4 px-6 text-xl">
                            <FiAlertCircle className="w-[30px] h-[30px] text-red-500"/>
                            <h1 className="font-bold">Possible Duplicate Expense</h1>
                        </div>

                        <div className="py-4 px-6">
                            <p className="text-sm mb-4">An expense with the same date, account, and amount already exists:</p>

                            <div className="space-y-4">
                                {renderExpenseDetails(dialogState.matchingExpense, 'Existing Expense')}
                                {renderExpenseDetails(dialogState.expense, 'New Expense')}
                            </div>
                        </div>

                        <div className="py-4 px-6 flex justify-end gap-4">
                            <button
                                type="button"
                                className="py-4 px-4 rounded bg-red-500 hover:bg-red-700 text-white cursor-pointer"
                                onClick={handleReject}
                            >
                                Reject
                            </button>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                                onClick={handleAccept}
                            >
                                Add Anyway
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </DuplicateExpenseContext.Provider>
    )
}

export const useDuplicateExpenseDialog = (): DuplicateExpenseContextType => {
    const context = useContext(DuplicateExpenseContext)
    if (!context) {
        throw new Error('useDuplicateExpenseDialog must be used within a DuplicateExpenseProvider')
    }
    return context
} 