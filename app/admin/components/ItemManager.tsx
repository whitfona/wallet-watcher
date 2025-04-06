import React, {type FormEvent, type ChangeEvent} from 'react'
import {FaRegSave} from 'react-icons/fa'
import {IoAddCircleOutline} from 'react-icons/io5'
import {TbCancel} from 'react-icons/tb'
import {FaRegTrashCan} from 'react-icons/fa6'
import {DialogConfirmButton} from '~/components/DialogConfirmButton'

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
    }: ItemManagerProps<T>) {
    return (
        <section>
            <h2 className="font-bold text-gray-700">{title}</h2>
            <form className="mt-2 flex items-center" onSubmit={onItemSubmit}>
                <input
                    type="text"
                    name={itemType.toLowerCase()}
                    placeholder={`Add ${itemType.toLowerCase()}...`}
                    className="border-1 border-gray-200 rounded-md p-1 mr-2 w-3/4"
                    value={newItem.name}
                    onChange={onItemChange}
                />
                <div className="flex gap-2">
                    {newItem.name && (
                        <button className="cursor-pointer text-green-400 hover:text-green-600" type="submit">
                            {newItem.id ?
                                <FaRegSave className="w-[20px] h-[20px]"/> :
                                <IoAddCircleOutline className="w-[20px] h-[20px]"/>}
                        </button>
                    )}
                    {newItem.id && (
                        <DialogConfirmButton
                            triggerText={<FaRegTrashCan className="w-[20px] h-[20px] text-red-300 hover:text-red-500"/>}
                            onAccept={() => onItemDelete(newItem.id!)}
                            deleteText={newItem.name}
                        />
                    )}
                    {newItem.name && (
                        <button className="cursor-pointer" type="button" onClick={onItemCancel}>
                            <TbCancel className="w-[20px] h-[20px] text-gray-400 hover:text-gray-700"/>
                        </button>
                    )}
                </div>
            </form>
            <ul className="mt-2 border border-gray-200 rounded px-2 divide-y divide-gray-100 text-gray-700 max-h-[320px] overflow-auto">
                {items.map((item) => (
                    <li
                        key={item.id}
                        // className="odd:bg-white even:bg-gray-100"
                        className="p-2"
                        onClick={() => onItemClick(item)}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </section>
    )
}
