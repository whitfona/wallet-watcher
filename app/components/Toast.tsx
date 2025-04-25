import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react'
import {FaRegCircleCheck} from 'react-icons/fa6'
import {IoMdClose} from 'react-icons/io'
import {IoAlertCircleOutline, IoInformationCircleOutline, IoWarningOutline} from 'react-icons/io5'

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    success: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

interface ToastComponentProps {
    message: string
    type: ToastType
    onClose: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const ToastComponent = ({message, type, onClose}: ToastComponentProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        // Auto close after 4 seconds
        const timer = setTimeout(() => {
            if (dialogRef.current) {
                dialogRef.current.close()
                onClose()
            }
        }, 4000)

        return () => clearTimeout(timer)
    }, [onClose])

    const countdownBarColour = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-500'
            case 'error':
                return 'bg-red-500'
            case 'info':
                return 'bg-gray-500'
            default:
                return 'bg-green-500'
        }
    }

    const handleClose = () => {
        if (dialogRef.current) {
            dialogRef.current.close()
            onClose()
        }
    }

    return (
        <dialog
            ref={dialogRef}
            open
            className="fixed top-4 left-1/2 transform -translate-x-1/2 shadow-[0px_4px_12px_0px_rgba(0,_0,_0,_0.1)] rounded m-0 p-0 z-50"
        >
            <div className="relative py-6 px-4 w-80 text-sm text-gray-500">
                <button
                    className="absolute top-1 right-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                    onClick={handleClose}
                >
                    <IoMdClose/>
                </button>

                <div className="flex items-center gap-2">
                    {type === 'success' && (
                        <FaRegCircleCheck className="w-[20px] h-[20px] text-green-600 flex-shrink-0"/>
                    )}
                    {type === 'error' && (
                        <IoAlertCircleOutline className="w-[20px] h-[20px] text-red-600 flex-shrink-0"/>
                    )}
                    {type === 'warning' && (
                        <IoWarningOutline className="w-[20px] h-[20px] text-yellow-500 flex-shrink-0"/>
                    )}
                    {type === 'info' && (
                        <IoInformationCircleOutline className="w-[20px] h-[20px] text-gray-500 flex-shrink-0"/>
                    )}

                    <p>{message}</p>
                </div>

                <span
                    className={`absolute bottom-0 left-0 rounded-b-xl w-full h-1 ${countdownBarColour()} animate-(--animate-toast-countdown)`}
                ></span>
            </div>
        </dialog>
    )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = `toast-${Date.now()}`
        setToasts(prev => [...prev, {id, message, type}])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const contextValue = {
        success: (message: string) => addToast(message, 'success'),
        warning: (message: string) => addToast(message, 'warning'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
    }

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {toasts.map(toast => (
                <ToastComponent
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </ToastContext.Provider>
    )
}

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}