const phone = (value: string): string => {
    const input = value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
    const areaCode = input.substring(0, 3);
    const middle = input.substring(3, 6);
    const last = input.substring(6, 10);

    if (input.length > 6) {
        value = `(${areaCode}) ${middle} - ${last}`;
    } else if (input.length > 3) {
        value = `(${areaCode}) ${middle}`;
    } else if (input.length > 0) {
        value = `(${areaCode}`;
    }

    return value;
};

const currency = (value: string, args?: string): string => {
    const [format, currency] = args?.split('|') || '';

    const strippedValue = value
        .replace('.', '')
        .replace(',', '')
        .replace(/\D/g, '');

    const float = +(strippedValue);

    if (isNaN(float)) {
        throw new Error(`Value provided to currency is not a number: ${value}`);
    }

    return new Intl.NumberFormat(format || 'en-US', {
        currency: currency || 'USD',
        style: 'currency',
    }).format(float / 100);
}

const date = (value: string): string => {
    const strippedValue = value.replace(/\D/g, '').slice(0, 10);
    if (strippedValue.length >= 5) {
        return `${strippedValue.slice(0, 2)}/${strippedValue.slice(2, 4)}/${strippedValue.slice(4, 8)}`;
    } else if (strippedValue.length >= 3) {
        return `${strippedValue.slice(0, 2)}/${strippedValue.slice(2)}`;
    }
    return strippedValue;
}

const masks = {
    phone,
    currency,
    date
}

export default masks
