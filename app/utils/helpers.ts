export const formatDate = (date: string) => {
    const parsedDate = new Date(date)

    parsedDate.setMinutes(parsedDate.getMinutes() + parsedDate.getTimezoneOffset())
    return parsedDate.toLocaleDateString('en-CA')
}

export const formatCurrency = (currency: number | null, decimalPlaces: number = 2) => {
    if (!currency) {
        return ''
    }
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: decimalPlaces
    }).format(currency)
}

export const formatDateForTimestamptz = (date: string | Date) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date

    const dateOnlyString = parsedDate.toISOString().split('T')[0]

    return {
        startTimestamp: `${dateOnlyString}T00:00:00`,
        endTimestamp: `${dateOnlyString}T23:59:59.999`
    }
}