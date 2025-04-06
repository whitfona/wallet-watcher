import {FaCaretDown, FaCaretLeft, FaCaretRight} from 'react-icons/fa'
import React, {useEffect, useRef, useState} from 'react'

export const DialogCalendar = () => {
    const MONTHS: { [key: number]: string } = {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec',
    }

    const calendarRef = useRef<HTMLDialogElement>(null)
    const [month, setMonth] = useState<number>()
    const [year, setYear] = useState<number>()

    useEffect(() => {
        const today = new Date()

        setMonth(today.getMonth() + 1)
        setYear(today.getFullYear())

        calendarRef.current?.addEventListener('click', onClick)

        return () => {
            calendarRef.current?.removeEventListener('click', onClick)
        }
    }, [])

    const openCalendar = () => {
        calendarRef.current?.showModal()
    }

    const onMonthSelected = (month: number) => {
        setMonth(month)
        closeCalendar()
    }

    const onYearChange = (action: 'increment' | 'decrement') => {
        if (!year) {
            return
        }

        action === 'increment' ? setYear(year + 1) : setYear(year - 1)
    }

    const onClick = (event: Event) => {
        if (event.target === calendarRef.current) {
            closeCalendar()
        }
    }

    const closeCalendar = () => {
        calendarRef.current?.close()
    }

    return (
        <div className="max-w-fit mx-auto mb-10">
            <button
                className="flex items-center gap-1 text-center font-bold uppercase cursor-pointer"
                type="button"
                onClick={openCalendar}
            >
                {MONTHS[month ?? 1]} {year ?? 2025} <FaCaretDown className="inline-block"/>
            </button>

            <dialog
                ref={calendarRef}
                className="justify-self-center mt-[5%] border border-gray-100 rounded-lg p-4 shadow backdrop:bg-black/60"
            >
                <div className="flex justify-between">
                    <FaCaretLeft
                        className="w-[20px] h-[20px] cursor-pointer text-gray-400 hover:text-gray-700"
                        onClick={() => onYearChange('decrement')}
                    />
                    <p className="text-center">{year}</p>
                    <FaCaretRight
                        className="w-[20px] h-[20px] cursor-pointer text-gray-400 hover:text-gray-700"
                        onClick={() => onYearChange('increment')}
                    />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                    {Object.entries(MONTHS).map(([key, month]) => (
                        <p
                            key={key}
                            className="cursor-pointer rounded hover:bg-gray-200 py-2 px-4"
                            onClick={() => onMonthSelected(parseInt(key))}
                        >
                            {month}
                        </p>
                    ))}
                </div>

            </dialog>
        </div>
    )
}