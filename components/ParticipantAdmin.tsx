import * as React from 'react';
import type { ParticipantTileProps } from '@livekit/components-react';
import { ParticipantTile } from '@livekit/components-react';
import { TrackRefContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';

type ParticipantTileWithAdminOptionsProps = ParticipantTileProps & {
  isAdmin: boolean;
  roomName: string;
  kickParticipant: (room: string, identity: string) => void;
  muteTrack: (room: string, identity: string, trackSid: string, muted: boolean) => void;
};

export const ParticipantTileWithAdminOptions = React.forwardRef<HTMLDivElement, ParticipantTileWithAdminOptionsProps>(
  function ParticipantTileWithAdminOptions(
    { isAdmin, roomName, kickParticipant, muteTrack, ...props },
    ref
  ) {
    // Pega o trackRef do contexto do TrackLoop
    const trackRef = React.useContext(TrackRefContext);

    // Se não houver trackRef, renderiza normalmente
    if (!trackRef || !trackRef.participant) {
      return <ParticipantTile ref={ref} {...props} />;
    }

    const participant = trackRef.participant;
    const identity = participant.identity;

    // Função para mutar todos os tracks de áudio e vídeo publicados
    const handleMute = () => {
      // Mutar todos os tracks de áudio
      participant.audioTrackPublications.forEach(pub => {
        if (pub.trackSid) {
          muteTrack(roomName, identity, pub.trackSid, true);
        }
      });
      // Se quiser mutar vídeo também, descomente abaixo:
      // participant.videoTrackPublications.forEach(pub => {
      //   if (pub.trackSid) {
      //     muteTrack(roomName, identity, pub.trackSid, true);
      //   }
      // });
    };

    return (
      <div style={{ position: 'relative'}}>
        <ParticipantTile ref={ref} {...props} style={{ height: '100%' }} />
        {isAdmin && identity && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => kickParticipant(roomName, identity)}
            >
              Expulsar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleMute}
            >
              Mutar
            </Button>
          </div>
        )}
      </div>
    );
  }
);