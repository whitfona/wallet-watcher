import {FaRegCircleCheck} from 'react-icons/fa6'
import {IoMdClose} from 'react-icons/io'
import {useCallback, useEffect, useRef} from 'react'
import {IoAlertCircleOutline, IoWarningOutline} from 'react-icons/io5'

interface ToastProps {
    message: string
    type?: 'success' | 'warning' | 'error'
}

export const Toast = ({message, type = 'success'}: ToastProps) => {
    const toastRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        setTimeout(() => {
            handleClose()
        }, 4000)
    }, [])

    const handleClose = () => {
        toastRef.current?.close()
    }

    const countdownBarColour = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-500'
            case 'error':
                return 'bg-red-500'
            default:
                return 'bg-green-500'
        }
    }

    return (
        <dialog ref={toastRef} open
                className="justify-self-center shadow-[0px_4px_12px_0px_rgba(0,_0,_0,_0.1)] rounded">

            <div className="relative py-6 px-4 w-80 text-md text-gray-500">
                <button
                    className="absolute top-1 right-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                    onClick={handleClose}
                >
                    <IoMdClose/>
                </button>

                <div className="flex items-center gap-2">
                    {type === 'success' &&
                        <FaRegCircleCheck className="w-[30px] h-[30px] text-green-600 flex-shrink-0"/>}
                    {type === 'error' &&
                        <IoAlertCircleOutline className="w-[30px] h-[30px] text-red-600 flex-shrink-0"/>}
                    {type === 'warning' &&
                        <IoWarningOutline className="w-[30px] h-[30px] text-yellow-500 flex-shrink-0"/>}

                    <p>{message}</p>
                </div>

                <span
                    className={`absolute bottom-0 left-0 rounded-b-xl w-[100%] h-[4px] ${countdownBarColour()} animate-(--animate-toast-countdown)`}>
            </span>
            </div>
        </dialog>
    )
}