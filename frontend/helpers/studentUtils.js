// Split "Last, First" into separate fields
export function splitFullName(fullName) {
    if (!fullName.includes(',')) return { first: '', last: '' };

    const [last, first] = fullName.split(',').map(str => str.trim());
    return { first, last };
}

// Check if student exists in "Student Basic Info" table
export async function studentExists(firstName, lastName, studentTable) {
    const query = await studentTable.selectRecordsAsync({ fields: ['Participant First Name', 'Participant Last Name'] });

    for (let record of query.records) {
        const matchFirst = record.getCellValueAsString('Participant First Name')?.trim().toLowerCase();
        const matchLast = record.getCellValueAsString('Participant Last Name')?.trim().toLowerCase();

        if (matchFirst === firstName.toLowerCase() && matchLast === lastName.toLowerCase()) {
            return true;
        }
    }

    return false;
}


export async function findParticipantRecordId(first, last, participantTable) {
    const records = await participantTable.selectRecordsAsync({ fields: ['First Name', 'Last Name'] });

    for (let record of records.records) {
        const matchFirst = record.getCellValueAsString('First Name')?.trim().toLowerCase();
        const matchLast = record.getCellValueAsString('Last Name')?.trim().toLowerCase();

        if (matchFirst === first.toLowerCase() && matchLast === last.toLowerCase()) {
            return record.id;
        }
    }

    return null;
}
