import React from 'react';
import { createRoot } from 'react-dom/client';
import Aplikasi from './src/Aplikasi';
import '../css/app.css';

const elemenAkar = document.getElementById('root');
if (elemenAkar) {
    const akar = createRoot(elemenAkar);
    akar.render(
        <React.StrictMode>
            <Aplikasi />
        </React.StrictMode>
    );
}
