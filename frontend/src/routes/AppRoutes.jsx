import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage.jsx';
import TariffsPage from '../pages/TariffsPage.jsx';
import SubscriptionPage from '../pages/SubscriptionPage.jsx';
import VpnConnectPage from '../pages/VpnConnectPage.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/profile" element={<Navigate to="/" replace />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/account" element={<SubscriptionPage />} />
            <Route path="/subscription" element={<Navigate to="/account" replace />} />
            <Route path="/subscriptions/:subscriptionId" element={<Navigate to="/config" replace />} />
            <Route path="/vpn" element={<Navigate to="/config" replace />} />
            <Route path="/config" element={<VpnConnectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
} 
