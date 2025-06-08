import {read, utils} from 'xlsx'
import type {ExpenseRecord, ImportCounters, ImportedExpense, SelectInterface} from '@/types/common'
import React from 'react'
import {categorizeExpense} from '@/dashboard/services/categoryService'

export const parseExcelFile = async (
    fileContent: string | ArrayBuffer,
    accounts: SelectInterface[]
): Promise<ImportedExpense[]> => {
    const workbook = read(fileContent, {type: 'binary', cellDates: true})
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const header = ['date', 'account', 'payee', 'category', 'memo', 'outflow', 'inflow']
    const sheetData: ImportedExpense[] = utils.sheet_to_json(sheet, {header: header})

    // Filter valid expenses (accounts must exist)
    return sheetData.slice(1).filter(item => {
        const account = accounts.find((acc) => acc.label.toLowerCase() === item.account?.toLowerCase())
        return !!account?.value
    })
}

export const formatImportedExpenseForDialog = (
    item: ImportedExpense,
    formattedDate: string,
    account: SelectInterface
): ExpenseRecord => {
    return {
        id: -1, // Temporary id for dialog
        date: formattedDate,
        account: account.label,
        payee: item.payee || '',
        category: item.category || '',
        memo: item.memo || '',
        outflow: item.outflow,
        inflow: item.inflow
    }
}

export const displayImportStatus = (
    counters: ImportCounters,
    toast: { success: (message: string) => void; error: (message: string) => void; info: (message: string) => void }
): void => {
    const {successCount, duplicateCount, skippedCount, errorCount} = counters

    if (successCount > 0) {
        let message = `${successCount} expenses imported successfully.`
        if (skippedCount > 0 || errorCount > 0) {
            message += ` ${skippedCount} skipped.`
            if (errorCount > 0) {
                message += ` ${errorCount} failed due to errors.`
            }
        }
        toast.success(message)
    } else if (duplicateCount > 0 && successCount === 0) {
        let message = `No new expenses imported. All were duplicates or skipped.`
        if (errorCount > 0) {
            message += ` ${errorCount} failed due to errors.`
        }
        toast.info(message)
    } else {
        let message = 'Failed to import expenses'
        if (errorCount > 0) {
            message += ` (${errorCount} errors encountered)`
        }
        toast.error(message)
    }
}

export const processExpense = async (
    item: ImportedExpense,
    counters: ImportCounters,
    processNextFunction: (index: number) => Promise<void>,
    currentIndex: number,
    options: {
        accounts: SelectInterface[],
        categories: SelectInterface[],
        checkForDuplicateExpense: (expense: any) => Promise<ExpenseRecord | undefined>,
        createPayeeIfNeeded: (payeeName: string | number | null) => Promise<number | null>,
        insertExpense: (
            formattedDate: string,
            accountId: number,
            payeeId: number | null,
            categoryId: number | null,
            memo: string,
            outflow: number | null,
            inflow: number | null
        ) => Promise<boolean>,
        showDialogDuplicationExpense: (
            newExpense: ExpenseRecord,
            duplicate: ExpenseRecord,
            onAdd: () => void,
            onSkip: () => void
        ) => void
    }
): Promise<void> => {
    const {
        accounts,
        categories,
        checkForDuplicateExpense,
        createPayeeIfNeeded,
        insertExpense,
        showDialogDuplicationExpense
    } = options

    try {
        const account = accounts.find((acc) => acc.label.toLowerCase() === item.account?.toLowerCase())
        if (!account?.value) {
            counters.skippedCount++
            await processNextFunction(currentIndex + 1)
            return
        }

        // Format data for duplicate checking
        const formattedDate = new Date(item.date).toISOString()
        const expenseToCheck = {
            date: formattedDate,
            account: account.value,
            outflow: item.outflow,
            inflow: item.inflow
        }

        const duplicate = await checkForDuplicateExpense(expenseToCheck)
        const category = await categorizeExpense(item, categories)

        if (duplicate) {
            counters.duplicateCount++
            const newExpenseFormatted = formatImportedExpenseForDialog(item, formattedDate, account)

            showDialogDuplicationExpense(
                newExpenseFormatted,
                duplicate,
                async () => {
                    const payeeId = await createPayeeIfNeeded(item.payee)
                    const success = await insertExpense(
                        formattedDate,
                        account.value as number,
                        payeeId,
                        category?.value || null,
                        item.memo || '',
                        item.outflow,
                        item.inflow
                    )

                    if (success) {
                        counters.successCount++
                        counters.duplicateCount--  // This is no longer a duplicate since we added it
                    } else {
                        counters.errorCount++
                    }

                    await processNextFunction(currentIndex + 1)
                },
                () => {
                    processNextFunction(currentIndex + 1)
                }
            )
        } else {
            const payeeId = await createPayeeIfNeeded(item.payee)
            const success = await insertExpense(
                formattedDate,
                account.value as number,
                payeeId,
                category?.value || null,
                item.memo || '',
                item.outflow,
                item.inflow
            )

            if (success) {
                counters.successCount++
            } else {
                counters.errorCount++
            }

            await processNextFunction(currentIndex + 1)
        }
    } catch (error) {
        console.error('Error processing expense:', error instanceof Error ? error.message : error)
        counters.errorCount++
        await processNextFunction(currentIndex + 1)
    }
}

export const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    options: {
        accounts: SelectInterface[],
        categories: SelectInterface[],
        fileUploadRef: React.RefObject<HTMLInputElement | null>,
        toast: {
            success: (message: string) => void;
            error: (message: string) => void;
            info: (message: string) => void
        },
        month: number,
        year: number,
        refreshPayees: () => Promise<boolean>,
        fetchExpenses: (month: number, year: number) => Promise<void>,
        checkForDuplicateExpense: (expense: any) => Promise<ExpenseRecord | undefined>,
        createPayeeIfNeeded: (payeeName: string | number | null) => Promise<number | null>,
        insertExpense: (
            formattedDate: string,
            accountId: number,
            payeeId: number | null,
            categoryId: number | null,
            memo: string,
            outflow: number | null,
            inflow: number | null
        ) => Promise<boolean>,
        showDialogDuplicationExpense: (
            newExpense: ExpenseRecord,
            duplicate: ExpenseRecord,
            onAdd: () => void,
            onSkip: () => void
        ) => void
    }
): Promise<void> => {
    const {
        accounts,
        categories,
        fileUploadRef,
        toast,
        month,
        year,
        refreshPayees,
        fetchExpenses,
        checkForDuplicateExpense,
        createPayeeIfNeeded,
        insertExpense,
        showDialogDuplicationExpense
    } = options

    if (!e.target || !e.target.files) {
        return
    }

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result) {
            return
        }

        try {
            const validExpenses = await parseExcelFile(event.target.result, accounts)

            if (validExpenses.length === 0) {
                toast.error('No valid expenses found in the file')
                return
            }

            toast.info(`Processing ${validExpenses.length} expenses...`)

            // Counters for tracking import progress
            const counters: ImportCounters = {
                successCount: 0,
                duplicateCount: 0,
                skippedCount: 0,
                errorCount: 0
            }

            // Define the recursive processing function
            const processNextExpense = async (index: number): Promise<void> => {
                // All expenses processed
                if (index >= validExpenses.length) {
                    await refreshPayees()
                    await fetchExpenses(month, year)
                    displayImportStatus(counters, toast)
                    if (fileUploadRef.current) {
                        fileUploadRef.current.value = ''
                    }
                    return
                }

                // Process the current expense
                await processExpense(
                    validExpenses[index],
                    counters,
                    processNextExpense,
                    index,
                    {
                        accounts,
                        categories,
                        checkForDuplicateExpense,
                        createPayeeIfNeeded,
                        insertExpense,
                        showDialogDuplicationExpense
                    }
                )
            }

            // Start processing the first expense
            await processNextExpense(0)

        } catch (error) {
            console.error('Error importing expenses:', error)
            toast.error('Failed to import expenses')
            if (fileUploadRef.current) {
                fileUploadRef.current.value = ''
            }
        }
    }

    reader.readAsArrayBuffer(file)
}
