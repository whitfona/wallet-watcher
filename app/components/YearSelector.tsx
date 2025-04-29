import {FaCaretLeft, FaCaretRight} from 'react-icons/fa'
import React from 'react'

interface YearSelectorProps {
    setYearChange: (year: number) => void
    year: number
    className?: string
}

export const YearSelector = (
    {setYearChange, year, className}: YearSelectorProps
) => {

    const handleYearChange = (action: 'increment' | 'decrement') => {
        if (!year) {
            return
        }

        action === 'increment' ? setYearChange(year + 1) : setYearChange(year - 1)
    }
    return (
        <div className={`flex justify-between items-center gap-2 ${className}`}>
            <FaCaretLeft
                className="w-[20px] h-[20px] cursor-pointer text-gray-400 hover:text-gray-700"
                onClick={() => handleYearChange('decrement')}
            />
            <p className="text-center">{year}</p>
            <FaCaretRight
                className="w-[20px] h-[20px] cursor-pointer text-gray-400 hover:text-gray-700"
                onClick={() => handleYearChange('increment')}
            />
        </div>
    )
}