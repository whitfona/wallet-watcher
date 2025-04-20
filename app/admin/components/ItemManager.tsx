import {type FormEvent, type ChangeEvent} from 'react'
import {FaRegSave} from 'react-icons/fa'
import {TbCancel} from 'react-icons/tb'
import {FaRegTrashCan} from 'react-icons/fa6'
import {DialogConfirmButton} from '@/components/DialogConfirmButton'
import {IoMdAddCircleOutline} from 'react-icons/io'
import {Loader} from '@/components/Loader'

interface ItemManagerProps<T> {
    title: string
    itemType: 'Category' | 'Account' | 'Payee'
    items: T[]
    newItem: T
    onItemChange: (e: ChangeEvent<HTMLInputElement>) => void
    onItemSubmit: (e: FormEvent<HTMLFormElement>) => void
    onItemCancel: () => void
    onItemClick: (item: T) => void
    onItemDelete: (id: number) => void
    isLoading?: boolean
}

export function ItemManager<T extends { id?: number; name: string }>(
    {
        title,
        itemType,
        items,
        newItem,
        onItemChange,
        onItemSubmit,
        onItemCancel,
        onItemClick,
        onItemDelete,
        isLoading = false
    }: ItemManagerProps<T>) {
    return (
        <section>
            <h2 className="font-bold text-gray-700">{title}</h2>
            <form className="mt-2 flex items-center" onSubmit={onItemSubmit}>
                <input
                    type="text"
                    name={itemType.toLowerCase()}
                    placeholder={`Add ${itemType.toLowerCase()}...`}
                    className="input-styles p-1 mr-2 w-3/4"
                    value={newItem.name}
                    onChange={onItemChange}
                    disabled={isLoading}
                />
                <div className="flex gap-2">
                    {newItem.name && (
                        <button
                            className="cursor-pointer text-green-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading}
                        >
                            {newItem.id ?
                                <FaRegSave className="w-[20px] h-[20px]"/> :
                                <IoMdAddCircleOutline className="w-[20px] h-[20px]"/>}
                        </button>
                    )}
                    {newItem.id && (
                        <DialogConfirmButton
                            triggerText={<FaRegTrashCan className="w-[20px] h-[20px] text-red-300 hover:text-red-500"/>}
                            onAccept={() => onItemDelete(newItem.id!)}
                            deleteText={newItem.name}
                            disabled={isLoading}
                        />
                    )}
                    {newItem.name && (
                        <button
                            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                            onClick={onItemCancel}
                            disabled={isLoading}
                        >
                            <TbCancel className="w-[20px] h-[20px] text-gray-400 hover:text-gray-700"/>
                        </button>
                    )}
                </div>
            </form>
            <div className="mt-4">
                {isLoading ? (
                    <Loader/>
                ) : (
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                onClick={() => onItemClick(item)}
                            >
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
