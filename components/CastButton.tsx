'use client';

import { Cast } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export function CastButton({ adminIdentity }: { adminIdentity: string }) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      // Verifica se a Remote Playback API está disponível em qualquer vídeo
      const video = document.createElement('video');
      // @ts-expect-error - remote is not in standard video type yet
      if (video.remote && video.remote.prompt) {
        setIsAvailable(true);
      }
    };

    checkAvailability();
  }, []);

  const handleCast = () => {
    // Procura o elemento de vídeo do admin. 
    // O LiveKit geralmente adiciona data-lk-participant-identity no container do tile.
    const tiles = document.querySelectorAll(`[data-lk-participant-placeholder-identity="${adminIdentity}"], [data-lk-participant-identity="${adminIdentity}"]`);
    
    let videoElement: HTMLVideoElement | null = null;
    tiles.forEach(tile => {
      const video = tile.querySelector('video');
      if (video) videoElement = video as HTMLVideoElement;
    });

    if (!videoElement) {
      // Fallback: procura qualquer vídeo se não achar pelo identity (menos preciso)
      videoElement = document.querySelector('video');
    }

    if (videoElement && videoElement.remote) {
      videoElement.remote.prompt().then(
        () => console.log('Remote playback prompt shown'),
        (err: unknown) => {
          if (err !== 'cancel') {
            console.error('Remote playback failed', err);
          }
        }
      );
    } else {
      alert('Chromecast não disponível para este vídeo no seu navegador.');
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
