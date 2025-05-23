import { initializeBlock } from '@airtable/blocks/ui';
import AutoUpdateApp from './AutoUpdateApp';
import StudentUploadPage from './StudentUploadPage';
import {Home} from './Home';
import React, { useState } from 'react';
import { InstructionsPage } from './InstructionsPage';


function App() {
    const [view, setView] = useState('home');
    const [csvDataForSchedule, setCsvDataForSchedule] = useState(null);

    if (view === 'auto-update') {
        return <AutoUpdateApp 
        onNavigate={setView}
        externalCsvDataForSchedule={csvDataForSchedule} />;
    }
    if (view === 'add-student') {
        return <StudentUploadPage 
            onNavigate={setView} 
            setCsvDataForSchedule={setCsvDataForSchedule}/>
    }
    if (view === 'instructions') {
        return <InstructionsPage onNavigate={setView} />;
    }

    return <Home onNavigate={setView} />;
}

initializeBlock(() => <App />);