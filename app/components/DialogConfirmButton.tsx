import {type ReactNode, useEffect, useRef} from 'react'
import {FiAlertCircle} from 'react-icons/fi'

interface ConfirmationButtonProps {
    triggerText: ReactNode
    onAccept: (...args: any[]) => any
    deleteText?: string
    rejectButtonText?: string
    acceptButtonText?: string
}

export const DialogConfirmButton = (
    {
        triggerText,
        onAccept,
        deleteText = 'these records',
        rejectButtonText = 'Cancel',
        acceptButtonText = 'Delete'
    }: ConfirmationButtonProps) => {

    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        dialogRef.current?.addEventListener('close', closeDialog)

        return () => {
            dialogRef.current?.removeEventListener('close', closeDialog)
        }
    }, [])
    const openDialog = () => {
        dialogRef.current?.showModal()
        document.body.style.overflow = 'hidden'
    }

    const closeDialog = () => {
        dialogRef.current?.close()
        document.body.style.overflow = ''
    }

    const handleAccept = () => {
        closeDialog()
        onAccept()
    }

    return (
        <>
            <button className="cursor-pointer" onClick={openDialog} type="button">{triggerText}</button>

            <dialog ref={dialogRef} className="place-self-center rounded-lg backdrop:bg-black/60">

                <div className="flex items-center gap-2 border-b border-gray-200 py-4 px-6 text-xl">
                    <FiAlertCircle className="w-[30px] h-[30px] text-red-500"/>
                    <h1 className="font-bold">Are you sure?</h1>
                </div>

                <div className="py-4 px-6">
                    <p>Do you really want to delete <span className="font-bold">{deleteText}</span>? This process cannot
                        be undone.</p>
                </div>

                <div className="py-4 px-6 flex justify-end gap-4">
                    <button
                        type="button"
                        className="border border-gray-400 rounded py-4 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={closeDialog}
                    >
                        {rejectButtonText}
                    </button>
                    <button
                        type="button"
                        className="rounded py-4 px-4 bg-red-500 hover:bg-red-700 text-white cursor-pointer"
                        onClick={handleAccept}
                    >
                        {acceptButtonText}
                    </button>
                </div>

            </dialog>
        </>
    )
}