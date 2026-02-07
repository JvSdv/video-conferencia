'use client';

import { Cast } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export function CastButton() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      // @ts-expect-error - cast is not in window type
      if (window.cast?.framework) {
        setIsAvailable(true);
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCast = () => {
    // @ts-expect-error - cast is not in window type
    const castContext = window.cast?.framework?.CastContext.getInstance();
    if (castContext) {
      castContext.requestSession().then(
        () => console.log('Cast session started'),
        (err: unknown) => {
          if (err !== 'cancel') {
            console.error('Cast session failed', err);
          }
        }
      );
    } else {
      alert('Chromecast não disponível. Certifique-se de estar usando o Chrome e ter um dispositivo na rede.');
    }
  };

  if (!isAvailable) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 shadow-lg transition-all hover:scale-110"
      onClick={handleCast}
      title="Transmitir para a TV"
    >
      <Cast className="w-6 h-6" />
    </Button>
  );
}
