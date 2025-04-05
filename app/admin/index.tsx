import React, {type FormEvent, useEffect, useState} from 'react'
import {FaPlusCircle, FaRegSave} from 'react-icons/fa'
import type {Account, Category, Payee} from '~/types/common'
import {fakeAccounts, fakePayees, fakeCategories} from '~/fake-data'
import {TbCancel} from 'react-icons/tb'
import {FaRegTrashCan} from 'react-icons/fa6'
import {DialogConfirmButton} from '~/components/DialogConfirmButton'

export function Index() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [payees, setPayees] = useState<Payee[]>([])

    useEffect(() => {
        setAccounts(fakeAccounts)
        setCategories(fakeCategories)
        setPayees(fakePayees)
    }, [])

    const [newCategory, setNewCategory] = useState<Category>({id: undefined, name: ''})

    const onCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const categoryName = e.target.value

        if (!categoryName) {
            setNewCategory({id: undefined, name: categoryName})
        } else {
            setNewCategory({...newCategory, name: categoryName})
        }
    }
    const onCategorySubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newCategory) {
            return
        }

        if (newCategory.id) {
            setCategories([...categories, newCategory])
        } else {

            setCategories([...categories, {id: categories.length + 1, name: newCategory.name}])
        }
        setNewCategory({id: undefined, name: ''})
    }
    const onCategoryClick = (category: Category) => {
        setNewCategory(category)
    }
    const onCategoryDelete = (categoryId: number) => {
        const categoriesAfterRemoval = categories.filter(category => category.id !== categoryId)
        setCategories(categoriesAfterRemoval)
        setNewCategory({id: undefined, name: ''})
    }
    const onCategoryCancel = () => {
        setNewCategory({id: undefined, name: ''})
    }

    const [newPayee, setNewPayee] = useState<Payee>({id: undefined, name: ''})
    const onPayeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const payeeName = e.target.value

        if (!payeeName) {
            setNewPayee({id: undefined, name: payeeName})
        } else {
            setNewPayee({...newPayee, name: payeeName})
        }
    }
    const onPayeeSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newPayee) {
            return
        }

        if (newPayee.id) {
            setPayees([...payees, newPayee])
        } else {
            setPayees([...payees, {id: payees.length + 1, name: newPayee.name}])
        }
        setNewPayee({id: undefined, name: ''})
    }
    const onPayeeClick = (payee: Payee) => {
        setNewPayee(payee)
    }
    const onPayeeDelete = (payeeId: number) => {
        const payeesAfterRemoval = payees.filter(payee => payee.id !== payeeId)
        setPayees(payeesAfterRemoval)
        setNewPayee({id: undefined, name: ''})
    }
    const onPayeeCancel = () => {
        setNewPayee({id: undefined, name: ''})
    }

    const [newAccount, setNewAccount] = useState<Account>({id: undefined, name: ''})
    const onAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const payeeName = e.target.value

        if (!payeeName) {
            setNewAccount({id: undefined, name: payeeName})
        } else {
            setNewAccount({...newAccount, name: payeeName})
        }
    }
    const onAccountSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newAccount) {
            return
        }

        if (newAccount.id) {
            setAccounts([...accounts, newAccount])
        } else {
            setAccounts([...accounts, {id: accounts.length + 1, name: newAccount.name}])
        }
        setNewAccount({id: undefined, name: ''})
    }
    const onAccountClick = (account: Account) => {
        setNewAccount(account)
    }
    const onAccountDelete = (accountId: number) => {
        const accountsAfterRemoval = accounts.filter(account => account.id !== accountId)
        setAccounts(accountsAfterRemoval)
        setNewAccount({id: undefined, name: ''})
    }
    const onAccountCancel = () => {
        setNewAccount({id: undefined, name: ''})
    }

    const nickTest = () => {
        console.log('DELETE NICK')
    }
    return (
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
                <section>
                    <h2 className="font-bold">Categories</h2>
                    <form onSubmit={onCategorySubmit}>
                        <input
                            type="text"
                            name="category"
                            placeholder="Add category..."
                            className="border-1 border-gray-200 rounded-md p-1 mr-2"
                            value={newCategory.name}
                            onChange={onCategoryChange}/>
                        {newCategory.name &&
                            <button className="cursor-pointer" type="submit">
                                {newCategory.id ? <FaRegSave/> : <FaPlusCircle/>}
                            </button>
                        }
                        {newCategory.id &&
                            <DialogConfirmButton
                                triggerText={<FaRegTrashCan/>}
                                onAccept={() => onCategoryDelete(newCategory.id!)}
                                deleteText={newCategory.name}
                            />
                        }
                        {newCategory.name &&
                            <button className="cursor-pointer" type="button" onClick={onCategoryCancel}>
                                <TbCancel/>
                            </button>
                        }
                    </form>
                    <ul>
                        {categories.map(category => (
                            <li key={category.id}
                                onClick={() => onCategoryClick(category)}>{category.name}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="font-bold">Payees</h2>
                    <form onSubmit={onPayeeSubmit}>
                        <input
                            type="text"
                            name="payee"
                            placeholder="Add payee..."
                            className="border-1 border-gray-200 rounded-md p-1 mr-2"
                            value={newPayee.name}
                            onChange={onPayeeChange}/>
                        {newPayee.name &&
                            <button className="cursor-pointer" type="submit">
                                {newPayee.id ? <FaRegSave/> : <FaPlusCircle/>}
                            </button>
                        }
                        {newPayee.id &&
                            <DialogConfirmButton
                                triggerText={<FaRegTrashCan/>}
                                onAccept={() => onPayeeDelete(newPayee.id!)}
                                deleteText={newPayee.name}
                            />
                        }
                        {newPayee.name &&
                            <button className="cursor-pointer" type="button" onClick={onPayeeCancel}>
                                <TbCancel/>
                            </button>
                        }
                    </form>
                    <ul>
                        {payees.map(payee => (
                            <li key={payee.id} onClick={() => onPayeeClick(payee)}>{payee.name}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="font-bold">Accounts</h2>
                    <form onSubmit={onAccountSubmit}>
                        <input
                            type="text"
                            name="account"
                            placeholder="Add account..."
                            className="border-1 border-gray-200 rounded-md p-1 mr-2"
                            value={newAccount.name}
                            onChange={onAccountChange}/>
                        {newAccount.name &&
                            <button className="cursor-pointer" type="submit">
                                {newAccount.id ? <FaRegSave/> : <FaPlusCircle/>}
                            </button>
                        }
                        {newAccount.id &&
                            <DialogConfirmButton
                                triggerText={<FaRegTrashCan/>}
                                onAccept={() => onAccountDelete(newAccount.id!)}
                                deleteText={newAccount.name}
                            />
                        }
                        {newAccount.name &&
                            <button className="cursor-pointer" type="button" onClick={onAccountCancel}>
                                <TbCancel/>
                            </button>
                        }
                    </form>
                    <ul>
                        {accounts.map(account => (
                            <li key={account.id} onClick={() => onAccountClick(account)}>{account.name}</li>
                        ))}
                    </ul>
                </section>

            </div>
        </main>
    )
}
