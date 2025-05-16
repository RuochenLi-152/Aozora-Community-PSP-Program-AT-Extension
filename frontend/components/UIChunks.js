
import React from 'react';
import { Box, Text, Button } from '@airtable/blocks/ui';

export function MissingStudentBanner({ student, onClose, formUrl, onNavigate }) {
    return (
        <Box marginBottom={3} backgroundColor="#fff3cd" padding={3} borderRadius={4} border="thick" borderColor="yellow">
            <Text color="orange" fontWeight="bold">
                Student "{student.first} {student.last}" not found in the database.
            </Text>
            <Text>Please create a record for this student before importing.</Text>
            <Box marginTop={2}>
                <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        padding: '8px 12px',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                    }}
                >
                     Open Student Form
                </a>
            </Box>
            
            <Button
                    variant="secondary"
                    onClick={() => onNavigate && onNavigate('add-student')}
                >
                     Add via Upload
                </Button>

            <Button variant="primary" marginTop={3} onClick={onClose}>
                Done
            </Button>
        </Box>
    );
}

export function FileDropZone({ isDragging, onClick }) {
    return (
        <Box
            height="200px"
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
            onClick={onClick}
        >
            <Text>
                {isDragging
                    ? '📥 Drop your CSV file here!'
                    : '📂 Drag & drop your CSV here, or click to browse'}
            </Text>
        </Box>
    );
}

export function ImportActions({ filename, rowCount, onImport, onReset }) {
    return (
        <Box marginTop={3}>
            <Text>📎 Loaded: {filename} ({rowCount} rows)</Text>
            <Box marginTop={2} display="flex" gap={2}>
                <Button variant="primary"     
                onClick={async () => {
                    await onImport();
                    onReset();
                }} marginRight={3}>
                    Start Import
                </Button>
                <Button variant="danger" onClick={onReset}>
                    Remove File
                </Button>
            </Box>
        </Box>
    );
}