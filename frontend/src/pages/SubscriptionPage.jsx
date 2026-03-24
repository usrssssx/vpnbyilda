import { useDeviceDetect } from '../hooks/useDeviceDetect';
import DesktopSubscriptionPage from '../components/desktop/SubscriptionPage';
import MobileSubscriptionPage from '../components/mobile/SubscriptionPage';

export default function SubscriptionPage() {
    const { isMobile } = useDeviceDetect();
    return isMobile ? <MobileSubscriptionPage /> : <DesktopSubscriptionPage />;
}