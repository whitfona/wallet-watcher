import type {ExpenseRecord} from '@/types/common'
import {formatCurrency, formatDate} from '@/utils/helpers'
import React from 'react'

export const RenderExpenseDetails = (expense: ExpenseRecord, title: string) => (
    <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <h3 className="font-bold mb-2">{title}</h3>
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