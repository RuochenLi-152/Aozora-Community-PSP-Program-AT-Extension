import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Text,
    Button,
    useBase,
    TablePickerSynced
} from '@airtable/blocks/ui';
import { useGlobalConfig } from '@airtable/blocks/ui';
import Papa from 'papaparse';
import { formatRowForAirtable } from './helpers/formatRow';
import { parseCustomDate, getLatestEnrolledTimeFromFirstRow, getWeekNumberFromDate, extractDateAndDay} from './helpers/dateUtils';
import { splitFullName, studentExists, extractWeekFromClass, findParticipantRecordId } from './helpers/studentUtils';
import { MissingStudentBanner, FileDropZone, ImportActions} from './components/UIChunks'

function AutoUpdateApp({onNavigate}) {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    const selectedTableId = globalConfig.get("targetTable");
    const table = base.getTableByIdIfExists(selectedTableId);
    const formUrl = `https://airtable.com/appphAT0hdIvIuCsL/pagJLHpFMpnQSpWT1/form`;

    const [csvData, setCsvData] = useState([]);
    const [filename, setFilename] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [missingStudent, setMissingStudent] = useState(null);
    const [checkBeforeAdd, setCheckBeforeAdd] = useState(false);
    const [addedRecordsSummary, setAddedRecordsSummary] = useState([]);


    const inputRef = useRef();

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);
        window.addEventListener('dragleave', handleDragLeave);
        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragleave', handleDragLeave);
        };
    }, []);

    const tablePicker = (
        <Box marginBottom={3}>
            <Text fontWeight="bold">Target Table:</Text>
            <TablePickerSynced globalConfigKey="targetTable" />
        </Box>
    );

    if (table && table.name.trim() !== "Enrollsy Import") {
        return (
            <Box padding={3}>
                <Text fontWeight="bold" marginBottom={2}>
                    Upload CSV to Auto-Clean for: {base.name}
                </Text>
                {tablePicker}
                <Text color="red" marginTop={2}>⚠️ Please select the "Enrollsy Import" table to continue.</Text>
            </Box>
        );
    }

    const handleFiles = (files) => {
        const file = files[0];
        if (!file || !file.name.endsWith('.csv')) return;

        setFilename(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const cleanedData = [];
                let lastStudent = '';
                let lastEnrolled = '';

                for (let row of results.data) {
                    const currentStudent = row['Student']?.trim();
                    if (currentStudent) lastStudent = currentStudent;
                    else row['Student'] = lastStudent;

                    const currentEnrolled = row['Enrolled']?.trim();
                    if (currentEnrolled) lastEnrolled = currentEnrolled;
                    else row['Enrolled'] = lastEnrolled;

                    if (row['Student']) cleanedData.push(row);
                }

                setCsvData(cleanedData);
            },
        });
    };

    const handleStartImport = async () => {
        if (!table) return;
        const airtableFields = table.fields;
        const latestEnrolled = await getLatestEnrolledTimeFromFirstRow(table);
        const studentTable = base.getTableByNameIfExists('Student Basic Info');
        const summaryList = [];

        const rowsToImport = csvData.filter(row => {
            const parsed = parseCustomDate(row['Enrolled']);
            return parsed && (!latestEnrolled || parsed > latestEnrolled);
        });

        // Step 1: Check that all students exist before inserting anything
        for (let row of rowsToImport) {
            const { first, last } = splitFullName(row['Student']);

            const exists = await studentExists(first, last, studentTable);

            if (!exists) {
                setMissingStudent({ first, last });
                alert(`⚠️ Student "${first} ${last}" not found.\nPlease go to Forms and create their record first.`);
                return;
            }
        }

        // Step 2: If all pass, proceed with import
        for (let row of rowsToImport) {
            const formatted = formatRowForAirtable(row, airtableFields);
            await table.createRecordAsync(formatted);
        }
        
        setAddedRecordsSummary(summaryList);
        alert(`✅ Imported ${rowsToImport.length} rows into "${table.name}"`);
    };

    const resetUpload = () => {
        setCsvData([]);
        setFilename('');
        inputRef.current.value = '';
    };

    

    return (
        <Box padding={3}>

            <Button onClick={() => onNavigate('home')} marginBottom={3}>
                 ← Back
            </Button>

            <Text fontWeight="bold" marginBottom={4}>
                Upload Enrollsy .csv file below to auto update student records! 
            </Text>

    
            {tablePicker}
    
            {!table ? (
                <Text color="red" marginTop={2}>
                    ⚠️ No table selected.
                </Text>
            ) : table.name.trim() !== "Enrollsy Import" ? (
                <Text color="red" marginTop={2}>
                    ⚠️ Please select the "Enrollsy Import" table to continue.
                </Text>
            ) : (
                <>
                    {missingStudent && (
                        <MissingStudentBanner
                            student={missingStudent}
                            formUrl={formUrl}
                            onClose={() => setMissingStudent(null)}
                            onNavigate={onNavigate}
                        />
                    )}

                    <Box marginBottom={3}>
                        <label>
                            <input
                                type="checkbox"
                                checked={checkBeforeAdd}
                                onChange={() => setCheckBeforeAdd(!checkBeforeAdd)}
                                style={{ marginRight: '8px' }}
                            />
                            Check & Update Weeks - Slower
                        </label>
                    </Box>


                    <FileDropZone
                        isDragging={isDragging}
                        onClick={() => inputRef.current?.click()}
                    />
    
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFiles(e.target.files)}
                    />

    
                    {filename && (
                        <ImportActions
                            filename={filename}
                            rowCount={csvData.length}
                            onImport={handleStartImport}
                            onReset={resetUpload}
                        />
                    )}
                    
                    {addedRecordsSummary.length > 0 && (
                        <Box marginTop={3} padding={3} border="default" backgroundColor="#f8f9fa">
                            <Text fontWeight="bold">Import Summary:</Text>
                            {addedRecordsSummary.map((record, index) => (
                                <Box key={index} marginTop={1}>
                                    <Text>
                                        ✅ {record.first} {record.last}
                                        {record.weeks.length > 0 && ` added to ${record.weeks.join(', ')}`}
                                        {record.extended && ` (Extended Care added)`}
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    )}
                </>
            )}

        </Box>
    );
    
}

export default AutoUpdateApp;