import React, {createContext, useCallback, useContext, useState} from 'react'
import {FiAlertCircle} from 'react-icons/fi'
import type {ExpenseRecord} from '@/types/common'
import {RenderExpenseDetails} from '@/components/RenderExpenseDetails'

interface DuplicateExpenseContextType {
    showDialogDuplicationExpense: (expense: ExpenseRecord, matchingExpense: ExpenseRecord, onAccept: () => void, onReject: () => void) => void
}

interface DuplicateExpenseDialogProps {
    children: React.ReactNode
}

interface DialogState {
    isOpen: boolean
    expense: ExpenseRecord | null
    matchingExpense: ExpenseRecord | null
    onAccept: (() => void) | null
    onReject: (() => void) | null
}

const DuplicateExpenseContext = createContext<DuplicateExpenseContextType | undefined>(undefined)

export const DuplicateExpenseProvider: React.FC<DuplicateExpenseDialogProps> = ({children}) => {
    const [dialogState, setDialogState] = useState<DialogState>({
        isOpen: false,
        expense: null,
        matchingExpense: null,
        onAccept: null,
        onReject: null
    })

    const showDialogDuplicationExpense = useCallback((
        expense: ExpenseRecord,
        matchingExpense: ExpenseRecord,
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
        <DuplicateExpenseContext.Provider value={{showDialogDuplicationExpense}}>
            {children}
            {dialogState.isOpen && dialogState.expense && dialogState.matchingExpense && (
                <dialog
                    open
                    className="fixed inset-0 z-50 m-0 p-0 h-full w-full bg-transparent"
                >
                    <div className="fixed inset-0 bg-black/60" onClick={handleReject}/>
                    <div
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl">
                        <div className="flex items-center gap-2 border-b border-gray-200 py-4 px-6 text-xl">
                            <FiAlertCircle className="w-[30px] h-[30px] text-red-500"/>
                            <h1 className="font-bold">Possible Duplicate Expense</h1>
                        </div>

                        <div className="py-4 px-6">
                            <p className="text-sm mb-4">An expense with the same date, account, and amount already
                                exists:</p>

                            <div className="space-y-4">
                                {RenderExpenseDetails(dialogState.matchingExpense, 'Existing Expense')}
                                {RenderExpenseDetails(dialogState.expense, 'New Expense')}
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

export const useDialogDuplicateExpense = (): DuplicateExpenseContextType => {
    const context = useContext(DuplicateExpenseContext)
    if (!context) {
        throw new Error('useDuplicateExpenseDialog must be used within a DuplicateExpenseProvider')
    }
    return context
} 