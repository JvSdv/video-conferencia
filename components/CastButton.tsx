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
        (session: unknown) => {
          console.log('Cast session started', session);
          
          // O receptor padrão do Google (Default Media Receiver) exige uma URL de vídeo.
          // Para transmitir WebRTC em tempo real, o Google oficialmente exige um
          // "Custom Web Receiver". Sem ele, a TV só mostra a tela inicial.
          // A forma que "funciona" integrada é o usuário selecionar "Transmitir guia"
          // após este botão abrir a conexão.
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const chrome = (window as any).chrome;
          if (chrome && chrome.cast) {
            const mediaInfo = new chrome.cast.media.MediaInfo('', 'video/mp4');
            const request = new chrome.cast.media.LoadRequest(mediaInfo);
            // @ts-expect-error - session is unknown
            session.loadMedia(request).catch((e: unknown) => console.log('Load skipped/failed:', e));
          }
        },
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
