import { useDeviceDetect } from '../hooks/useDeviceDetect';
import DesktopVpnConnectPage from '../components/desktop/VpnConnectPage';
import MobileVpnConnectPage from '../components/mobile/VpnConnectPage';

export default function VpnConnectPage() {
  const { isMobile } = useDeviceDetect();
  return isMobile ? <MobileVpnConnectPage /> : <DesktopVpnConnectPage />;
}