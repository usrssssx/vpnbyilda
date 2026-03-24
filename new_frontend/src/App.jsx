// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Импортируйте ваши страницы
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import TariffsPage from './pages/TariffsPage';
import TrialPage from './pages/TrialPage';
import VpnConnectPage from './pages/VpnConnectPage';

function App() {
    return (
        <Layout>
            <Router>
                <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/tariffs" element={<TariffsPage />} />
                    <Route path="/trial" element={<TrialPage />} />
                    <Route path="/vpn" element={<VpnConnectPage />} />
                    <Route path="/" element={<ProfilePage />} /> {/* Дефолтный маршрут */}
                </Routes>
            </Router>
        </Layout>
    );
}

export default App;