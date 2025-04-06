import React, {useEffect, useState} from 'react'
import {fakeAccounts, fakePayees, fakeCategories} from '~/fake-data'
import {type Account, type Category, type Payee} from '~/types/common'
import {ItemManager} from '~/admin/components/ItemManager'
import {useToast} from '~/components/Toast'

interface ItemState<T> {
    items: T[]
    newItem: T
}

export function Index() {
    const toast = useToast()
    const [itemState, setItemState] = useState<{
        categories: ItemState<Category>
        payees: ItemState<Payee>
        accounts: ItemState<Account>
    }>({
        categories: {items: [], newItem: {id: undefined, name: ''}},
        payees: {items: [], newItem: {id: undefined, name: ''}},
        accounts: {items: [], newItem: {id: undefined, name: ''}}
    })

    useEffect(() => {
        setItemState(() => ({
            categories: {items: fakeCategories, newItem: {id: undefined, name: ''}},
            payees: {items: fakePayees, newItem: {id: undefined, name: ''}},
            accounts: {items: fakeAccounts, newItem: {id: undefined, name: ''}}
        }))
    }, [])

    const handleItemChange = (itemType: keyof typeof itemState, e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {
                ...prevState[itemType],
                newItem: {id: undefined, name: value}
            }
        }))
    }

    const handleItemSubmit = (itemType: keyof typeof itemState, e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newItem = itemState[itemType].newItem
        if (!newItem.name) {
            return
        }

        setItemState((prevState) => {
            const updatedItems = newItem.id
                ? prevState[itemType].items.map((item) =>
                    item.id === newItem.id ? newItem : item
                )
                : [
                    ...prevState[itemType].items,
                    {...newItem, id: prevState[itemType].items.length + 1}
                ]

            return {
                ...prevState,
                [itemType]: {items: updatedItems, newItem: {id: undefined, name: ''}}
            }
        })
        toast.success(`${newItem.name} has been updated successfully.`)
    }

    const handleItemCancel = (itemType: keyof typeof itemState) => {
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {...prevState[itemType], newItem: {id: undefined, name: ''}}
        }))
    }

    const handleItemClick = <T extends keyof typeof itemState>(
        itemType: T,
        item: typeof itemState[T]['newItem'] // Infer the type of item based on the itemType
    ) => {
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {...prevState[itemType], newItem: item}
        }))
    }

    const handleItemDelete = (itemType: keyof typeof itemState, id: number) => {
        setItemState((prevState) => {
            const updatedItems = prevState[itemType].items.filter(
                (item) => item.id !== id
            )
            return {
                ...prevState,
                [itemType]: {items: updatedItems, newItem: {id: undefined, name: ''}}
            }
        })
        toast.success('Item has been deleted successfully.')
    }

    return (
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
                <ItemManager
                    itemType="Category"
                    items={itemState.categories.items}
                    newItem={itemState.categories.newItem}
                    onItemChange={(e) => handleItemChange('categories', e)}
                    onItemSubmit={(e) => handleItemSubmit('categories', e)}
                    onItemCancel={() => handleItemCancel('categories')}
                    onItemClick={(category) => handleItemClick('categories', category)}
                    onItemDelete={(id) => handleItemDelete('categories', id)}
                />
                <ItemManager
                    itemType="Payee"
                    items={itemState.payees.items}
                    newItem={itemState.payees.newItem}
                    onItemChange={(e) => handleItemChange('payees', e)}
                    onItemSubmit={(e) => handleItemSubmit('payees', e)}
                    onItemCancel={() => handleItemCancel('payees')}
                    onItemClick={(payee) => handleItemClick('payees', payee)}
                    onItemDelete={(id) => handleItemDelete('payees', id)}
                />
                <ItemManager
                    itemType="Account"
                    items={itemState.accounts.items}
                    newItem={itemState.accounts.newItem}
                    onItemChange={(e) => handleItemChange('accounts', e)}
                    onItemSubmit={(e) => handleItemSubmit('accounts', e)}
                    onItemCancel={() => handleItemCancel('accounts')}
                    onItemClick={(account) => handleItemClick('accounts', account)}
                    onItemDelete={(id) => handleItemDelete('accounts', id)}
                />
            </div>
        </main>
    )
}
