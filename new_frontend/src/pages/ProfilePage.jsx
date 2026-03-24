import { useDeviceDetect } from '../hooks/useDeviceDetect';
import DesktopProfilePage from '../components/desktop/ProfilePage';
import MobileProfilePage from '../components/mobile/ProfilePage';

export default function ProfilePage() {
    const { isMobile } = useDeviceDetect();
    return isMobile ? <MobileProfilePage /> : <DesktopProfilePage />;
}