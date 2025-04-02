import {type FormEvent, type FormEventHandler, useState} from 'react'

export function Index() {

    const [newCategory, setNewCategory] = useState<string>('')
    const [newPayee, setNewPayee] = useState<string>('')

    const onAddCategory = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newCategory) {
            return
        }

        categories.push({id: categories.length + 1, name: newCategory})
        setNewCategory('')
    }

    const onAddPayee = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newPayee) {
            return
        }

        payees.push({id: payees.length + 1, name: newPayee})
        setNewPayee('')
    }

    return (
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <header className="flex flex-col items-center gap-9">

                    <h2>Categories</h2>
                    <form onSubmit={onAddCategory}>
                        <input
                            type="text"
                            name="category"
                            placeholder="Add category..."
                            className="border-1 border-gray-200 rounded-md p-1 mx-2"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}/>
                        {newCategory && <button className="cursor-pointer" type="submit">⊕</button>}
                    </form>
                    <ul>
                        {categories.map(category => (
                            <li key={category.id}>{category.name}</li>
                        ))}
                    </ul>

                    <h2>Payees</h2>
                    <form onSubmit={onAddPayee}>
                        <input
                            type="text"
                            name="payee"
                            placeholder="Add payee..."
                            className="border-1 border-gray-200 rounded-md p-1 mx-2"
                            value={newPayee}
                            onChange={(e) => setNewPayee(e.target.value)}/>
                        <button className="cursor-pointer" type="submit">⊕</button>
                    </form>
                    <ul>
                        {payees.map(payee => (
                            <li key={payee.id}>{payee.name}</li>
                        ))}
                    </ul>

                </header>
            </div>
        </main>
    )
}

const categories = [
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
    }
]

const payees = [
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
    }
]