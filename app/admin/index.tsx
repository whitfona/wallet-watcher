import {useEffect} from 'react'
import {type Account, type Category, type Payee} from '@/types/common'
import {ItemManager} from '@/admin/components/ItemManager'
import {useItemManager} from '@/admin/hooks/useItemManager'
import {useToast} from '@/components/Toast'
import {supabase} from '@/utils/supabase'

export function Index() {
    const toast = useToast()
    const categoriesManager = useItemManager<Category>('categories')
    const payeesManager = useItemManager<Payee>('payees')
    const accountsManager = useItemManager<Account>('accounts')

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

                    categoriesManager.setItems(categoriesResponse.data)
                    payeesManager.setItems(payeesResponse.data)
                    accountsManager.setItems(accountsResponse.data)
                } catch (error) {
                    console.error('Error fetching data:', error)
                    toast.error('Failed to load data')
                }
            }

        ;(() => fetchData())()
    }, [])

    return (
        <main className="pt-16 pb-4">
            <div className="flex flex-col w-sm mx-auto gap-8">
                <ItemManager
                    title="Categories"
                    itemType="Category"
                    items={categoriesManager.itemState.items}
                    newItem={categoriesManager.itemState.newItem}
                    onItemChange={categoriesManager.handleItemChange}
                    onItemSubmit={categoriesManager.handleItemSubmit}
                    onItemCancel={categoriesManager.handleItemCancel}
                    onItemClick={categoriesManager.handleItemClick}
                    onItemDelete={categoriesManager.handleItemDelete}
                />
                <ItemManager
                    title="Payees"
                    itemType="Payee"
                    items={payeesManager.itemState.items}
                    newItem={payeesManager.itemState.newItem}
                    onItemChange={payeesManager.handleItemChange}
                    onItemSubmit={payeesManager.handleItemSubmit}
                    onItemCancel={payeesManager.handleItemCancel}
                    onItemClick={payeesManager.handleItemClick}
                    onItemDelete={payeesManager.handleItemDelete}
                />
                <ItemManager
                    title="Accounts"
                    itemType="Account"
                    items={accountsManager.itemState.items}
                    newItem={accountsManager.itemState.newItem}
                    onItemChange={accountsManager.handleItemChange}
                    onItemSubmit={accountsManager.handleItemSubmit}
                    onItemCancel={accountsManager.handleItemCancel}
                    onItemClick={accountsManager.handleItemClick}
                    onItemDelete={accountsManager.handleItemDelete}
                />
            </div>
        </main>
    )
}
