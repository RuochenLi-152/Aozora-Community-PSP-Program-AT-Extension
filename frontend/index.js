import { initializeBlock } from '@airtable/blocks/ui';
import AutoUpdateApp from './AutoUpdateApp';
import StudentUploadPage from './StudentUploadPage';
import {Home} from './Home';
import React, { useState } from 'react';
import { InstructionsPage } from './InstructionsPage';


function App() {
    const [view, setView] = useState('home');

    if (view === 'auto-update') {
        return <AutoUpdateApp onNavigate={setView} />;
    }
    if (view === 'add-student') {
        return <StudentUploadPage onNavigate={setView} />;
    }
    if (view === 'instructions') {
        return <InstructionsPage onNavigate={setView} />;
    }

    return <Home onNavigate={setView} />;
}

initializeBlock(() => <App />);