import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Button, useBase } from '@airtable/blocks/ui';
import Papa from 'papaparse';
import { FileDropZone, ImportActions } from './components/UIChunks';
import { splitFullName, studentExists } from './helpers/studentUtils';
import { parseDOB } from './helpers/dateUtils';

function StudentUploadPage({ onNavigate }) {
    const base = useBase();

    const [csvData, setCsvData] = useState([]);
    const [filename, setFilename] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef();

    // Drag-drop ezone
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

    // listeners
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

    const handleFiles = (files) => {
        const file = files[0];
        if (!file || !file.name.endsWith('.csv')) return;

        setFilename(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const validRows = results.data.filter(
                    row =>
                        row['Student'] &&
                        row['Student'] !== 'Student' &&
                        row['Birth Date'] !== 'Birth Date'
                );
        
                setCsvData(validRows);
                console.log("📥 Loaded student CSV:", validRows);
            },
        });
        
    };

    const resetUpload = () => {
        setCsvData([]);
        setFilename('');
        inputRef.current.value = '';
    };

    const handleUpload = async () => {
        const studentTable = base.getTableByNameIfExists("Student Basic Info");
        const airtableFields = studentTable.fields;
    
        const addedStudents = [];
    
        for (let row of csvData) {

            if (!row['Student']) continue;
            // if (row['Student'] === 'Student') {
            //     continue;
            // }
            // Use your existing helper to split the student full name
            const { first, last } = splitFullName(row['Student']);
    
            const exists = await studentExists(first, last, studentTable);
            if (exists) continue;
    
            // Convert age string to integer (7)
            let age = null;
            if (row['Age']) {
                const match = row['Age'].match(/^(\d+)y/);
                age = match ? parseInt(match[1]) : null;
            }
    
            // Prepare the formatted record
            const newRecord = {
                'Participant First Name': first,
                'Participant Last Name': last,
                'Date of Birth': parseDOB(row['Birth Date']),
                'Age': age,
    
                'Parent 1 - First Name': row['Acct First Name'] || '',
                'Parent 1 - Last Name': row['Acct Last Name'] || '',
                'Parent 1 - Email Address': row['Email'] || '',
                'Phone Number (Parent 1)': row['Acct Cell'] || '',
    
                'Parent 2 - First Name': row['Acct First Name 2'] || '',
                'Parent 2 - Last Name': row['Acct Last Name 2'] || '',
                'Parent 2 - Email Address': row['Email 2'] || '',
                'Phone Number (Parent 2)': row['Acct Cell 2'] || '',
                'How did you find out about Aozora Community?': row['How did you find out about Aozora Community?']
            };
    
            await studentTable.createRecordAsync(newRecord);
            addedStudents.push(`${first} ${last}`);
        }
    
        if (addedStudents.length > 0) {
            alert(`Added ${addedStudents.length} student(s):\n- ${addedStudents.join('\n- ')}`);
        } else {
            alert("No new students needed to be added — all exist.");
        }
    
        setCsvData([]);
        setFilename('');
    };
    

    return (
        <Box padding={3}>
            <Text fontWeight="bold" fontSize={4} marginBottom={4}>
                Upload Enrollsy .csv file to Add Students
            </Text>

            <Button
                marginBottom={3}
                variant="default"
                onClick={() => onNavigate('home')}
            >
                ← Back
            </Button>

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
                    onImport={handleUpload}
                    onReset={resetUpload}
                />
            )}
        </Box>
    );
}

export default StudentUploadPage;
