import React, {useState, useRef} from 'react'
import {FiAlertCircle} from 'react-icons/fi'
import {formatCurrency, formatDate} from '@/utils/helpers'
import type {ExpenseFormData} from '@/types/common'

interface UseConfirmDuplicateProps {
    onAccept: () => void
    onReject: () => void
    duplicateExpense?: ExpenseFormData
    matchingExpense?: ExpenseFormData
    getAccountLabel?: (id: number) => string | undefined
    getPayeeLabel?: (id: number) => string | undefined
    getCategoryLabel?: (id: number) => string | undefined
}

export const useConfirmDuplicate = (
    {
        onAccept,
        onReject,
        duplicateExpense,
        matchingExpense,
        getAccountLabel,
        getPayeeLabel,
        getCategoryLabel
    }: UseConfirmDuplicateProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const dialogRef = useRef<HTMLDialogElement>(null)

    const openDialog = () => {
        setIsOpen(true)
        dialogRef.current?.showModal()
    }

    const closeDialog = () => {
        setIsOpen(false)
        dialogRef.current?.close()
    }

    const handleAccept = () => {
        onAccept()
        closeDialog()
    }

    const handleReject = () => {
        onReject()
        closeDialog()
    }

    const renderExpenseDetails = (expense: ExpenseFormData, title: string) => (
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">{title}</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Date:</div>
                <div>{formatDate(expense.date)}</div>

                <div className="font-medium">Account:</div>
                <div>{expense.account && true ? getAccountLabel?.(expense.account) : ''}</div>

                {expense.payee && typeof expense.payee === 'number' && (
                    <>
                        <div className="font-medium">Payee:</div>
                        <div>{getPayeeLabel?.(expense.payee)}</div>
                    </>
                )}

                {expense.category && typeof expense.category === 'number' && (
                    <>
                        <div className="font-medium">Category:</div>
                        <div>{getCategoryLabel?.(expense.category)}</div>
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

    const Dialog = () => (
        <dialog
            ref={dialogRef}
            className="place-self-center border border-gray-100 rounded-lg p-4 shadow backdrop:bg-black/60"
        >
            <div className="flex items-center gap-2 border-b border-gray-200 py-4 px-6 text-xl">
                <FiAlertCircle className="w-[30px] h-[30px] text-red-500"/>
                <h1 className="font-bold">Possible Duplicate Expense</h1>
            </div>

            <div className="py-4 px-6">
                <p className="text-sm mb-4">An expense with the same date, account, and amount already exists:</p>

                <div className="space-y-4">
                    {matchingExpense && renderExpenseDetails(matchingExpense, 'Existing Expense')}
                    {duplicateExpense && renderExpenseDetails(duplicateExpense, 'New Expense')}
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
        </dialog>
    )

    return {
        isOpen,
        Dialog,
        openDialog,
        closeDialog
    }
} 