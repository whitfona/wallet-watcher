import {type ChangeEvent, type FormEvent, useEffect, useState} from 'react'
import {type Account, type Category, type Payee} from '@/types/common'
import {ItemManager} from '@/admin/components/ItemManager'
import {useToast} from '@/components/Toast'
import {supabase} from '@/utils/supabase'

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
        const fetchData = async () => {
                try {
                    const [categoriesResponse, payeesResponse, accountsResponse] = await Promise.all([
                        supabase.from('categories_view').select('*').order('name'),
                        supabase.from('payees_view').select('*').order('name'),
                        supabase.from('accounts_view').select('*').order('name')
                    ])

                    if (categoriesResponse.error) throw categoriesResponse.error
                    if (payeesResponse.error) throw payeesResponse.error
                    if (accountsResponse.error) throw accountsResponse.error

                    setItemState(() => ({
                        categories: {items: categoriesResponse.data, newItem: {id: undefined, name: ''}},
                        payees: {items: payeesResponse.data, newItem: {id: undefined, name: ''}},
                        accounts: {items: accountsResponse.data, newItem: {id: undefined, name: ''}}
                    }))
                } catch (error) {
                    console.error('Error fetching data:', error)
                    toast.error('Failed to load data')
                }
            }

        ;(() => fetchData())()
    }, [])

    const handleItemChange = (itemType: keyof typeof itemState, e: ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {
                ...prevState[itemType],
                newItem: {...prevState[itemType].newItem, name: value}
            }
        }))
    }

    const handleItemSubmit = async (itemType: keyof typeof itemState, e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newItem = itemState[itemType].newItem
        if (!newItem.name) {
            return
        }

        try {
            if (newItem.id) {
                const {error} = await supabase
                    .from(itemType)
                    .update({name: newItem.name})
                    .eq('id', newItem.id)

                if (error) {
                    toast.error(`Error updating ${newItem.name}`)
                    return
                }

                toast.success(`${newItem.name} has been updated successfully.`)
            } else {
                const {error} = await supabase
                    .from(itemType)
                    .insert([{name: newItem.name}])

                if (error) {
                    toast.error(`Error adding ${newItem.name}`)
                    return
                }

                toast.success(`${newItem.name} has been added successfully.`)
            }

            const {data, error} = await supabase
                .from(`${itemType}_view`)
                .select('*')
                .order('name')

            if (error) {
                toast.error('Error refreshing data')
                return
            }

            setItemState((prevState) => ({
                ...prevState,
                [itemType]: {items: data, newItem: {id: undefined, name: ''}}
            }))
        } catch (error) {
            toast.error('An unexpected error occurred')
        }
    }

    const handleItemCancel = (itemType: keyof typeof itemState) => {
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {...prevState[itemType], newItem: {id: undefined, name: ''}}
        }))
    }

    const handleItemClick = <T extends keyof typeof itemState>(
        itemType: T,
        item: typeof itemState[T]['newItem']
    ) => {
        setItemState((prevState) => ({
            ...prevState,
            [itemType]: {...prevState[itemType], newItem: item}
        }))
    }

    const handleItemDelete = async (itemType: keyof typeof itemState, id: number) => {
        const itemToDelete = itemState[itemType].items.find(item => item.id === id)
        if (!itemToDelete) return

        try {
            const {error} = await supabase
                .from(itemType)
                .delete()
                .eq('id', id)

            if (error) {
                toast.error(`Error deleting ${itemToDelete.name}`)
                return
            }

            const {data, error: fetchError} = await supabase
                .from(`${itemType}_view`)
                .select('*')
                .order('name')

            if (fetchError) {
                toast.error('Error refreshing data')
                return
            }

            setItemState((prevState) => ({
                ...prevState,
                [itemType]: {items: data, newItem: {id: undefined, name: ''}}
            }))

            toast.success(`${itemToDelete.name} has been deleted successfully.`)
        } catch (error) {
            toast.error('An unexpected error occurred')
        }
    }

    return (
        <main className="pt-16 pb-4">
            <div className="flex flex-col w-sm mx-auto gap-8">
                <ItemManager
                    title="Categories"
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
                    title="Payees"
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
                    title="Accounts"
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
