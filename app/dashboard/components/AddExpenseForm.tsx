import Select, {type SingleValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {IoMdAddCircleOutline} from 'react-icons/io'
import {TbCancel} from 'react-icons/tb'
import React, {type FormEvent} from 'react'
import type {ExpenseFormData, SelectInterface} from '@/types/common'

interface AddExpenseFormProps {
    newExpense: ExpenseFormData
    setNewExpense: React.Dispatch<React.SetStateAction<ExpenseFormData>>
    accounts: SelectInterface[]
    categories: SelectInterface[]
    payees: SelectInterface[]
    handleSubmit: (e: FormEvent) => void
    handleCancel: () => void
}

export const AddExpenseForm = (
    {
        newExpense,
        setNewExpense,
        accounts,
        categories,
        payees,
        handleSubmit,
        handleCancel,
    }: AddExpenseFormProps) => {

    const handleSelectChange = (name: string, event: SingleValue<SelectInterface> | {
        value: string | number;
        label: string | number | undefined;
    }) => {
        if (!event) {
            return
        }

        setNewExpense(prevExpense => ({
            ...prevExpense,
            [name]: event.value
        }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target

        const parsedValue = parseValue(value, type)

        setNewExpense(prevExpense => ({
            ...prevExpense,
            [name]: parsedValue
        }))
    }

    const parseValue = (value: string | number | null, type: string) => {
        let parsedValue: number | string | null
        if (type === 'number' || type === 'select-one') {
            if (value === '') {
                parsedValue = null
            } else {
                parsedValue = value ? Number(value) : null
            }
        } else {
            parsedValue = value ?? null
        }
        return parsedValue
    }

    return (
        <form className="flex flex-row flex-wrap gap-2 mb-2 px-4" onSubmit={handleSubmit}>
            <input className="input-styles text-xs"
                   type="date"
                   value={newExpense.date}
                   name="date"
                   onChange={handleChange}
            />
            <Select
                placeholder="Enter account..."
                options={accounts}
                value={accounts.find(account => account.value === newExpense.account) || null}
                onChange={(event) => handleSelectChange('account', event)}
                name="account"
                className="text-xs w-[149px]"
                styles={{
                    menu: base => ({...base, zIndex: 10}),
                    control: base => ({...base, border: '1px solid #d1d5dc'}),
                    placeholder: base => ({...base, color: '#99a1af'}),
                    dropdownIndicator: base => ({...base, color: '#d1d5dc'}),
                }}
            />
            <CreatableSelect
                placeholder="Enter payee..."
                options={payees}
                value={newExpense.payee ? {
                    value: newExpense.payee,
                    label: Number.isInteger(newExpense.payee) ? payees.find(payee => payee.value === newExpense.payee)?.label : newExpense.payee,
                } : null}
                onChange={(event) => handleSelectChange('payee', event)}
                name="payee"
                className="text-xs w-[149px]"
                styles={{
                    menu: base => ({...base, zIndex: 10}),
                    control: base => ({...base, border: '1px solid #d1d5dc'}),
                    placeholder: base => ({...base, color: '#99a1af'}),
                    dropdownIndicator: base => ({...base, color: '#d1d5dc'}),
                }}
            />
            <Select
                placeholder="Enter category..."
                options={categories}
                value={categories.find(category => category.value === newExpense.category) || null}
                onChange={(event) => handleSelectChange('category', event)}
                name="category"
                className="text-xs w-[153px]"
                styles={{
                    menu: base => ({...base, zIndex: 10}),
                    control: base => ({...base, border: '1px solid #d1d5dc'}),
                    placeholder: base => ({...base, color: '#99a1af'}),
                    dropdownIndicator: base => ({...base, color: '#d1d5dc'}),
                }}
            />
            <input className="input-styles text-xs"
                   placeholder="Enter memo..."
                   type="text"
                   name="memo"
                   value={newExpense.memo}
                   onChange={handleChange}
            />
            <input className="input-styles text-xs"
                   placeholder="Enter outflow..."
                   type="number"
                   name="outflow"
                   value={newExpense.outflow ?? ''}
                   onChange={handleChange}
            />
            <input className="input-styles text-xs"
                   placeholder="Enter inflow..."
                   type="number"
                   name="inflow"
                   value={newExpense.inflow ?? ''}
                   onChange={handleChange}
            />
            <button className="cursor-pointer text-green-400 hover:text-green-600" type="submit">
                <IoMdAddCircleOutline className="w-[20px] h-[20px]"/>
            </button>
            <button className="cursor-pointer text-gray-400 hover:text-gray-700" type="button"
                    onClick={handleCancel}>
                <TbCancel className="w-[20px] h-[20px]"/>
            </button>
        </form>
    )
}