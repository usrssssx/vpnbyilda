import { useDeviceDetect } from '../hooks/useDeviceDetect';
import DesktopTrialPage from '../components/desktop/TrialPage';
import MobileTrialPage from '../components/mobile/TrialPage';

export default function TrialPage() {
    const { isMobile } = useDeviceDetect();
    return isMobile ? <MobileTrialPage /> : <DesktopTrialPage />;
}