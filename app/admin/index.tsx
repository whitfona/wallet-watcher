import React, {type FormEvent, useState} from 'react'
import {FaPlusCircle, FaRegSave} from 'react-icons/fa'

interface Category {
    id?: number
    name: string
}

interface Payee {
    id?: number
    name: string
}

interface Account {
    id?: number
    name: string
}

export function Index() {

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
            categories.push(newCategory)
        } else {

            categories.push({id: categories.length + 1, name: newCategory.name})
        }
        setNewCategory({id: undefined, name: ''})
    }
    const onCategoryClick = (category: Category) => {
        setNewCategory(category)
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
            payees.push(newPayee)
        } else {
            payees.push({id: payees.length + 1, name: newPayee.name})
        }
        setNewPayee({id: undefined, name: ''})
    }
    const onPayeeClick = (payee: Payee) => {
        setNewPayee(payee)
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
            accounts.push(newAccount)
        } else {
            accounts.push({id: accounts.length + 1, name: newAccount.name})
        }
        setNewAccount({id: undefined, name: ''})
    }
    const onAccountClick = (account: Account) => {
        setNewAccount(account)
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

const categories: Category[] = [
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

const payees: Payee[] = [
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

const accounts: Account[] = [
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