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

const masks = {
    phone
}

export default masks
