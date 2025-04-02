declare module 'react-qr-scanner' {
    import { Component } from 'react';

    export interface QRScannerProps {
        delay?: number;
        onError?: (error: Error) => void;
        onScan?: (data: string | null) => void;
        facingMode?: 'user' | 'environment';
        constraints?: MediaTrackConstraints & { video?: MediaTrackConstraints }; // ✅ Allow 'video' as an optional key
        legacyMode?: boolean;
        resolution?: number;
        style?: React.CSSProperties;
        className?: string;
        showViewFinder?: boolean;
    }
    

    export default class QRScanner extends Component<QRScannerProps> {}
}
