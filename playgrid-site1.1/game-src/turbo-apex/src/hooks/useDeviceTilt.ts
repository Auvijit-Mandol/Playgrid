import { useEffect, useRef, useState } from 'react';

export function useDeviceTilt(enabled: boolean, sensitivity: number = 1.0) {
  const [tiltX, setTiltX] = useState(0); // -1 (left) to 1 (right)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const smoothedTilt = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setTiltX(0);
      smoothedTilt.current = 0;
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // gamma is left-to-right tilt in degrees (-90 to 90)
      const gamma = e.gamma;
      if (gamma === null) return;

      // Deadzone of 2 degrees to avoid jitter
      let normalized = 0;
      if (Math.abs(gamma) > 2) {
        normalized = (gamma / 25) * sensitivity; // 25 degrees is full steer
        normalized = Math.max(-1, Math.min(1, normalized));
      }

      // Smooth interpolation for responsive but stable steering
      smoothedTilt.current = smoothedTilt.current * 0.4 + normalized * 0.6;
      setTiltX(smoothedTilt.current);
    };

    // Check if permission is needed (iOS 13+ requires requestPermission, Android does not)
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((state) => {
          if (state === 'granted') {
            setHasPermission(true);
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            setHasPermission(false);
          }
        })
        .catch(() => setHasPermission(false));
    } else {
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled, sensitivity]);

  return { tiltX, hasPermission };
}
