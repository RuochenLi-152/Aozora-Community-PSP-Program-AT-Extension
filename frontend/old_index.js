import {
    initializeBlock,
    useBase,
    Box,
    Text,
    Button,
    TablePickerSynced,
} from '@airtable/blocks/ui';
import React, {useState, useRef, useEffect} from 'react';
import Papa from 'papaparse';
import {useGlobalConfig} from '@airtable/blocks/ui';

function formatRowForAirtable(csvRow, airtableFields) {
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
                    formattedRow[fieldName] = null; // or skip it entirely
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
                formattedRow[fieldName] = rawValue; // fallback
                break;
        }
    }

    return formattedRow;
}

function parseCustomDate(dateStr) {
    if (!dateStr) return null;

    // Example: "04/25/2025 @ 12:08 pm"
    const cleaned = dateStr.replace('@', '').trim();
    const parsed = new Date(cleaned);

    return isNaN(parsed.getTime()) ? null : parsed;
}




function AutoCleanApp() {

    async function getLatestEnrolledTimeFromFirstRow() {
        const query = await table.selectRecordsAsync({ fields: ['Enrolled'] });
        const firstRecord = query.records[0];
    
        if (!firstRecord) return null;
    
        const enrolledText = firstRecord.getCellValueAsString('Enrolled');
        const parsedDate = parseCustomDate(enrolledText);
    
        return parsedDate;
    }
    // === Airtable context ===
    const base = useBase();
    const globalConfig = useGlobalConfig();
    const selectedTableId = globalConfig.get("targetTable");
    const table = base.getTableByIdIfExists(selectedTableId);

    // === Component state ===
    const [csvData, setCsvData] = useState([]);
    const [filename, setFilename] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef();

    // === Optional UI: table picker component ===
    const tablePicker = (
        <Box marginBottom={3}>
            <Text fontWeight="bold">Target Table:</Text>
            <TablePickerSynced globalConfigKey="targetTable" />
        </Box>
    );

    // === Conditional early returns before rendering main UI ===
    if (!table) {
        return (
            <Box padding={3}>
                <Text fontWeight="bold" marginBottom={2}>
                    Upload CSV to Auto-Clean for: {base.name}
                </Text>
                {tablePicker}
                <Text color="red" marginTop={2}>⚠️ No table selected.</Text>
            </Box>
        );
    }

    if (table.name.trim() !== "Enrollsy Import") {
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


    // === Logic: file parsing & cleanup ===
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
                    if (currentStudent) {
                        lastStudent = currentStudent;
                    } else {
                        row['Student'] = lastStudent;
                    }

                    const currentEnrolled = row['Enrolled']?.trim();
                    if (currentEnrolled) {
                        lastEnrolled = currentEnrolled;
                    } else {
                        row['Enrolled'] = lastEnrolled;
                    }

                    if (row['Student']) {
                        cleanedData.push(row);
                    }
                }

                setCsvData(cleanedData);
                console.log('CSV Cleaned & Loaded:', cleanedData);
            },
        });
    };

    const handleStartImport = async () => {
        if (!table) return;
        const airtableFields = table.fields;
        const latestEnrolled = await getLatestEnrolledTimeFromFirstRow();

        const rowsToImport = csvData.filter(row => {
            const parsed = parseCustomDate(row['Enrolled']);
            return parsed && (!latestEnrolled || parsed > latestEnrolled);
        });

        for (let row of rowsToImport) {
            const formatted = formatRowForAirtable(row, airtableFields);
            await table.createRecordAsync(formatted);
        }

        alert(`✅ Imported ${rowsToImport.length} rows into "${table.name}"`);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
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

    const resetUpload = () => {
        setCsvData([]);
        setFilename('');
        inputRef.current.value = '';
    };

    // === Lifecycle: attach drag events ===
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

    // === Render UI ===
    return (
        <Box padding={3}>
            <Text fontWeight="bold" marginBottom={2}>
                Upload CSV to Auto-Clean for: {base.name}
            </Text>

            {tablePicker}

            <Box
                height="300px"
                border="thick"
                borderStyle="dashed"
                borderColor={isDragging ? 'blue' : 'lightGray'}
                backgroundColor={isDragging ? '#e3f2fd' : 'white'}
                borderRadius={6}
                padding={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                cursor="pointer"
                onClick={() => inputRef.current?.click()}
            >
                <Text>
                    {isDragging
                        ? '📥 Drop your CSV file here!'
                        : '📂 Drag & drop your CSV here, or click to browse'}
                </Text>
            </Box>

            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                style={{display: 'none'}}
                onChange={(e) => handleFiles(e.target.files)}
            />

            {filename && (
                <Box marginTop={3}>
                    <Text>📎 Loaded: {filename} ({csvData.length} rows)</Text>
                    <Box marginTop={2} display="flex" gap={2}>
                        <Button variant="primary" onClick={handleStartImport} marginRight={3}>
                            Start Import
                        </Button>
                        <Button variant="danger" onClick={resetUpload}>
                            Remove File
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

initializeBlock(() => <AutoCleanApp />);
