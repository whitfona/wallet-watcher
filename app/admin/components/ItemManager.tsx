import React, {type FormEvent, type ChangeEvent} from 'react'
import {FaRegSave} from 'react-icons/fa'
import {IoAddCircleOutline} from 'react-icons/io5'
import {TbCancel} from 'react-icons/tb'
import {FaRegTrashCan} from 'react-icons/fa6'
import {DialogConfirmButton} from '~/components/DialogConfirmButton'

interface ItemManagerProps<T> {
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
            <h2 className="font-bold">{itemType}s</h2>
            <form onSubmit={onItemSubmit}>
                <input
                    type="text"
                    name={itemType.toLowerCase()}
                    placeholder={`Add ${itemType.toLowerCase()}...`}
                    className="border-1 border-gray-200 rounded-md p-1 mr-2"
                    value={newItem.name}
                    onChange={onItemChange}
                />
                {newItem.name && (
                    <button className="cursor-pointer" type="submit">
                        {newItem.id ? <FaRegSave/> : <IoAddCircleOutline/>}
                    </button>
                )}
                {newItem.id && (
                    <DialogConfirmButton
                        triggerText={<FaRegTrashCan/>}
                        onAccept={() => onItemDelete(newItem.id!)}
                        deleteText={newItem.name}
                    />
                )}
                {newItem.name && (
                    <button className="cursor-pointer" type="button" onClick={onItemCancel}>
                        <TbCancel/>
                    </button>
                )}
            </form>
            <ul>
                {items.map((item) => (
                    <li key={item.id} onClick={() => onItemClick(item)}>
                        {item.name}
                    </li>
                ))}
            </ul>
        </section>
    )
}
