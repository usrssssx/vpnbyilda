import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage.jsx';
import TariffsPage from '../pages/TariffsPage.jsx';
import SubscriptionPage from '../pages/SubscriptionPage.jsx';
import VpnConnectPage from '../pages/VpnConnectPage.jsx';
import TrialPage from '../pages/TrialPage.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/vpn" element={<VpnConnectPage />} />
            <Route path="/trial" element={<TrialPage />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
    );
} 