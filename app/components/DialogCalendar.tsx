import {FaCaretDown} from 'react-icons/fa'
import React, {useEffect, useRef, useState} from 'react'
import {YearSelector} from '@/components/YearSelector'

interface DialogCalendarProps {
    initialMonth?: number
    initialYear?: number
    onDateChange?: (month: number, year: number) => void
    className?: string
}

export const DialogCalendar = ({initialMonth, initialYear, onDateChange, className}: DialogCalendarProps) => {
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
    const [month, setMonth] = useState<number>(initialMonth || new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(initialYear || new Date().getFullYear())

    useEffect(() => {
        calendarRef.current?.addEventListener('click', onClick)

        return () => {
            calendarRef.current?.removeEventListener('click', onClick)
        }
    }, [])

    useEffect(() => {
        if (month && year && onDateChange) {
            onDateChange(month, year)
        }
    }, [month, year])

    const openCalendar = () => {
        calendarRef.current?.showModal()
    }

    const onMonthSelected = (month: number) => {
        setMonth(month)
        closeCalendar()
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
        <div className="max-w-fit mx-auto">
            <button
                className={`flex items-center gap-1 text-center font-bold uppercase cursor-pointer ${className}`}
                type="button"
                onClick={openCalendar}
            >
                {MONTHS[month]} {year} <FaCaretDown className="inline-block"/>
            </button>

            <dialog
                ref={calendarRef}
                className="justify-self-center mt-[5%] border border-gray-100 rounded-lg p-4 shadow backdrop:bg-black/60"
            >
                <YearSelector
                    className="w-fit mx-auto"
                    year={year}
                    setYearChange={setYear}
                />

                <div className="grid grid-cols-4 gap-2 mt-4">
                    {Object.entries(MONTHS).map(([key, monthName]) => (
                        <p
                            key={key}
                            className={`cursor-pointer rounded py-2 px-4 ${
                                parseInt(key) === month ? 'bg-gray-200' : 'hover:bg-gray-200'
                            }`}
                            onClick={() => onMonthSelected(parseInt(key))}
                        >
                            {monthName}
                        </p>
                    ))}
                </div>

            </dialog>
        </div>
    )
}