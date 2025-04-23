export const formatDate = (date: string) => {
    const parsedDate = new Date(date)
    
    parsedDate.setMinutes(parsedDate.getMinutes() + parsedDate.getTimezoneOffset())
    return parsedDate.toLocaleDateString('en-CA')
}

export const formatCurrency = (currency: number | null) => {
    if (!currency) {
        return ''
    }
    return new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD'}).format(currency)
}