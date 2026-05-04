import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../../layanan/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [profilData, setProfilData] = useState(null);
    const [identitas, setIdentitas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topbarAction, setTopbarAction] = useState(null);

    const fetchDashboard = useCallback(async (force = false) => {
        if (dashboardData && !force) return;
        
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            if (response.data.status === 'success') {
                setDashboardData(response.data.data);
                setIdentitas(response.data.data.identitas);
                setError(null);
            }
        } catch (err) {
            setError(err.response?.status || 500);
        } finally {
            setLoading(false);
        }
    }, [dashboardData]);

    const fetchProfil = useCallback(async (force = false) => {
        if (profilData && !force) return;
        
        try {
            setLoading(true);
            const response = await api.get('/admin/profil-perusahaan');
            if (response.data.status === 'success') {
                setProfilData(response.data.data);
                setError(null);
            }
        } catch (err) {
            setError(err.response?.status || 500);
        } finally {
            setLoading(false);
        }
    }, [profilData]);

    const refreshAll = async () => {
        setLoading(true);
        await Promise.all([fetchDashboard(true), fetchProfil(true)]);
        setLoading(false);
    };

    return (
        <AdminContext.Provider value={{ 
            dashboardData, 
            profilData, 
            identitas, 
            loading, 
            error,
            fetchDashboard,
            fetchProfil,
            refreshAll,
            setIdentitas,
            topbarAction,
            setTopbarAction
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
