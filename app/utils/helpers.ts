export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-CA')
}

export const formatCurrency = (currency: number | null) => {
    if (!currency) {
        return ''
    }
    return new Intl.NumberFormat('en-CA', {style: 'currency', currency: 'CAD'}).format(currency)
}