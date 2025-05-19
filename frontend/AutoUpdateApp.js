
import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Text,
    Button,
    useBase,
} from '@airtable/blocks/ui';
import { useGlobalConfig } from '@airtable/blocks/ui';
import Papa from 'papaparse';
import { splitFullName } from './helpers/studentUtils';
import { MissingStudentBanner, FileDropZone, ImportActions } from './components/UIChunks';

function AutoUpdateApp({ onNavigate }) {
    const base = useBase();
    // const globalConfig = useGlobalConfig();
    const table = base.getTableByNameIfExists('Enrollsy Import');
    const formUrl = "https://airtable.com/appJeOfBr9YbqvNXZ/pagJLHpFMpnQSpWT1/form";

    const [csvData, setCsvData] = useState([]);
    const [filename, setFilename] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [missingStudent, setMissingStudent] = useState(null);
    const [addedRecordsSummary, setAddedRecordsSummary] = useState([]);
    const inputRef = useRef();

    useEffect(() => {
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

        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);
        window.addEventListener('dragleave', handleDragLeave);

        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragleave', handleDragLeave);
        };
    }, []);

    const handleFiles = (files) => {
        const file = files[0];
        if (!file || !file.name.endsWith('.csv')) return;

        setFilename(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const cleanedData = results.data.filter(
                    row => row['Student'] && row['Class'] && row['Days']
                );
                setCsvData(cleanedData);
            },
        });
    };

    const handleStartImport = async () => {
        const summaryList = [];
        const participantTable = base.getTableByNameIfExists('All Participants with Class');

        for (let row of csvData) {
            const { first, last } = splitFullName(row['Student']);
            const matchingRecords = await participantTable.selectRecordsAsync();
            const match = [...matchingRecords.records].find(r =>
                r.getCellValue("First Name")?.trim() === first &&
                r.getCellValue("Last Name")?.trim() === last
            );
            if (!match) {
                setMissingStudent({ first, last });
                console.warn(`Student not found: ${first} ${last}`);
                continue;
            }

            let classValue = null;
            const classText = row['Class'].toUpperCase();
            if (classText.includes('SUZUME')) classValue = 'Suzume';
            else if (classText.includes('HIBARI')) classValue = 'Hibari';
            else if (classText.includes('UGUISU')) classValue = 'Uguisu';
            else if (classText.includes('TSUBAME')) classValue = 'Tsubame';
            else classValue = 'TBD';

            const days = row['Days'].split(',').map(day => day.trim()).filter(Boolean).map(name => ({ name }));

            await participantTable.updateRecordAsync(match.id, {
                'Class': { name: classValue },
                'Days': days,
            });

            summaryList.push(`${first} ${last} → ${classValue} (${row['Days']})`);
        }

        setAddedRecordsSummary(summaryList);
        alert(`Updated ${summaryList.length} student(s).`);
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
                Upload Enrollsy .csv file below to update student class and days
            </Text>


            {missingStudent && (
                <MissingStudentBanner
                    student={missingStudent}
                    formUrl={formUrl}
                    onClose={() => setMissingStudent(null)}
                    onNavigate={onNavigate}
                /> 
            )}

            {!table ? (
                <Text color="red" marginTop={2}>
                    No table selected.
                </Text>
            ) : (
                <>
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
                            <Text fontWeight="bold">Update Summary:</Text>
                            {addedRecordsSummary.map((line, index) => (
                                <Box key={index} marginTop={1}>
                                    <Text> {line}</Text>
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
