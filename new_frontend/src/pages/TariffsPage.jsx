import { useDeviceDetect } from '../hooks/useDeviceDetect';
import DesktopTariffsPage from '../components/desktop/TariffsPage';
import MobileTariffsPage from '../components/mobile/TariffsPage';

export default function TariffsPage() {
    const { isMobile } = useDeviceDetect();
    return isMobile ? <MobileTariffsPage /> : <DesktopTariffsPage />;
}