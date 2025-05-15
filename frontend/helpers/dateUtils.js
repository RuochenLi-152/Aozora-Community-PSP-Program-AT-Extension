export function parseCustomDate(dateStr) {
    if (!dateStr) return null;

    const cleaned = dateStr.replace('@', '').trim();
    const parsed = new Date(cleaned);

    return isNaN(parsed.getTime()) ? null : parsed;
}

// Convert MM/DD/YYYY string to a Date object
export function parseDOB(dateStr) {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [month, day, year] = parts.map(part => parseInt(part, 10));
    const date = new Date(year, month - 1, day);

    return isNaN(date.getTime()) ? null : date;
}


export async function getLatestEnrolledTimeFromFirstRow(table) {
    const query = await table.selectRecordsAsync({ fields: ['Enrolled'] });
    const firstRecord = query.records[0];

    if (!firstRecord){
        const earliest = new Date(1970, 0, 1);
        return earliest;
    }

    const enrolledText = firstRecord.getCellValueAsString('Enrolled');
    return parseCustomDate(enrolledText);
}
