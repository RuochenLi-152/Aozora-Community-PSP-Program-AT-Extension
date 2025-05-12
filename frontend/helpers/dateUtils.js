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

export function getWeekNumberFromDate(dateStr) {
    const campStart = new Date("2025-07-07");
    const targetDate = new Date(dateStr);
    const diffInDays = Math.floor((targetDate - campStart) / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7) + 1;
}

export function extractDateAndDay(classText) {
    const regex = /Extended Care - (\w+), ([A-Za-z]+ \d{1,2})/;
    const match = classText.match(regex);
    if (!match) return null;

    const dayOfWeek = match[1];
    const dateStr = `${match[2]}, 2025`;
    return { dayOfWeek, dateStr };
}