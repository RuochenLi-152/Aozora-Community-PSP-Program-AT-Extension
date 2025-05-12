export function formatRowForAirtable(csvRow, airtableFields) {
    const formattedRow = {};

    for (let field of airtableFields) {
        const fieldName = field.name;
        const rawValue = csvRow[fieldName];

        if (rawValue === undefined) continue;

        switch (field.type) {
            case 'singleLineText':
            case 'multilineText':
                formattedRow[fieldName] = String(rawValue);
                break;

            case 'number':
                formattedRow[fieldName] = parseFloat(rawValue) || null;
                break;

            case 'checkbox':
                formattedRow[fieldName] = rawValue.toLowerCase() === 'true' || rawValue === '1';
                break;

            case 'date': {
                const date = new Date(rawValue);
                if (!isNaN(date.getTime())) {
                    formattedRow[fieldName] = date.toISOString();
                } else {
                    formattedRow[fieldName] = null;
                }
                break;
            }

            case 'singleSelect':
                formattedRow[fieldName] = { name: rawValue };
                break;

            case 'multipleSelects':
                formattedRow[fieldName] = rawValue.split(',').map(item => ({ name: item.trim() }));
                break;

            default:
                formattedRow[fieldName] = rawValue;
                break;
        }
    }

    return formattedRow;
}