import {type ChangeEvent, type FormEvent, useState} from 'react'
import {supabase} from '@/utils/supabase'
import {useToast} from '@/components/Toast'

interface ItemState<T> {
    items: T[]
    newItem: T
    isLoading: boolean
}

export function useItemManager<T extends { id?: number; name: string }>(tableName: string) {
    const toast = useToast()
    const [itemState, setItemState] = useState<ItemState<T>>({
        items: [],
        newItem: {id: undefined, name: ''} as T,
        isLoading: true
    })

    const setItems = (items: T[]) => {
        setItemState(prevState => ({
            ...prevState,
            items,
            isLoading: false
        }))
    }

    const handleItemChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target
        setItemState((prevState) => ({
            ...prevState,
            newItem: {...prevState.newItem, name: value}
        }))
    }

    const handleItemSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newItem = itemState.newItem
        if (!newItem.name) {
            return
        }

        setItemState(prevState => ({
            ...prevState,
            isLoading: true
        }))

        try {
            if (newItem.id) {
                const {error} = await supabase
                    .from(tableName)
                    .update({name: newItem.name})
                    .eq('id', newItem.id)

                if (error) {
                    toast.error(`Error updating ${newItem.name}`)
                    return
                }

                toast.success(`${newItem.name} has been updated successfully.`)
            } else {
                const {error} = await supabase
                    .from(tableName)
                    .insert([{name: newItem.name}])

                if (error) {
                    toast.error(`Error adding ${newItem.name}`)
                    return
                }

                toast.success(`${newItem.name} has been added successfully.`)
            }

            const {data, error} = await supabase
                .from(`${tableName}_view`)
                .select('*')
                .order('name')

            if (error) {
                toast.error('Error refreshing data')
                return
            }

            setItemState((prevState) => ({
                ...prevState,
                items: data,
                newItem: {id: undefined, name: ''} as T
            }))
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setItemState(prevState => ({
                ...prevState,
                isLoading: false
            }))
        }
    }

    const handleItemCancel = () => {
        setItemState((prevState) => ({
            ...prevState,
            newItem: {id: undefined, name: ''} as T
        }))
    }

    const handleItemClick = (item: T) => {
        setItemState((prevState) => ({
            ...prevState,
            newItem: item
        }))
    }

    const handleItemDelete = async (id: number) => {
        const itemToDelete = itemState.items.find(item => item.id === id)
        if (!itemToDelete) return

        setItemState(prevState => ({
            ...prevState,
            isLoading: true
        }))

        try {
            const {error} = await supabase
                .from(tableName)
                .delete()
                .eq('id', id)

            if (error) {
                toast.error(`Error deleting ${itemToDelete.name}`)
                return
            }

            const {data, error: fetchError} = await supabase
                .from(`${tableName}_view`)
                .select('*')
                .order('name')

            if (fetchError) {
                toast.error('Error refreshing data')
                return
            }

            setItemState((prevState) => ({
                ...prevState,
                items: data,
                newItem: {id: undefined, name: ''} as T
            }))

            toast.success(`${itemToDelete.name} has been deleted successfully.`)
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setItemState(prevState => ({
                ...prevState,
                isLoading: false
            }))
        }
    }

    return {
        itemState,
        setItems,
        handleItemChange,
        handleItemSubmit,
        handleItemCancel,
        handleItemClick,
        handleItemDelete
    }
} 