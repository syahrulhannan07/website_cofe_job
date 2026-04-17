import React from 'react';
import { RouterProvider } from 'react-router-dom';
import ruter from './ruter';

function Aplikasi() {
    return <RouterProvider router={ruter} />;
}

export default Aplikasi;
