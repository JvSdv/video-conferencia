'use client'

import { ChangeEvent, useEffect, useState } from "react"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantClickEvent,
  ParticipantTile,
  RoomAudioRenderer,
  TrackReference,
  useRoomContext,
  useTracks,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { LocalAudioTrack, LocalTrackPublication, RoomEvent, Track } from "livekit-client"
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader,
  Settings
} from 'lucide-react';
import { ParticipantTileWithAdminOptions } from "@/components/ParticipantAdmin";
import { CastButton } from "@/components/CastButton";


type KickParticipantRequest = {
  room: string;
  identity: string;
};

type MuteTrackRequest = {
  room: string;
  identity: string;
  trackSid: string;
  muted: boolean;
};

export default function Page() {
  const room = "quickstart-room"
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("username")
    if (storedName) {
      setName(storedName)
      generateToken(storedName)
    } else {
      setIsDialogOpen(true)
    }
  }, [])

  const generateToken = async (username: string) => {
    try {
      const resp = await fetch(
        `/api/get-participant-token?room=${room}&username=${username}`, {cache: "no-cache"}
      )
      const data = await resp.json()
      setToken(data.token)
    } catch (e) {
      console.error(e)
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() !== "") {
      const uniqueName = `${name}-${Math.random().toString(36).substr(2, 5)}`
      localStorage.setItem("username", uniqueName)
      setName(uniqueName)
      if(isEditing){
        setIsEditing(false);
        window.location.href = window.location.origin;
      }
      setIsDialogOpen(false)
      generateToken(uniqueName)
    }
  }

  const handleNameChange = (e:ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/-/g, "_");
    setName(newValue);
  };

  const handleOpenModalToEditName = () =>{
    setName((prev) => {
      const indexOfDash = prev.indexOf('-');
      return indexOfDash !== -1 ? prev.slice(0, indexOfDash) : prev;
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  }

  if (token === "" || isDialogOpen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (name.trim() !== "") {
            setIsDialogOpen(open)
          }
        }}>
          <DialogContent className="text-white gap-1">
            <DialogDescription>
            </DialogDescription>
            <DialogTitle>{isEditing ? "Edite": "Digite"} seu nome:</DialogTitle>
            <form onSubmit={handleNameSubmit}>
              <div className="grid gap-4 py-4">
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  required
                  autoFocus
                />
              </div>
              <DialogFooter >
                <Button type="submit" variant={"secondary"} className="font-semibold">{isEditing ? "Salvar": "Entrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {!isDialogOpen && <div className="flex">Carregando... <Loader width={16} height={16} className="animate-spin"/></div>}
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className="relative h-[100vh] w-[100vw]"
    >
      <MyVideoConference isAdmin={name.toLowerCase().includes("admin")} roomName={room}/>
      <RoomAudioRenderer />
      <ControlBar className="absolute bottom-10 bg-[#0F0F0F] rounded-lg left-[50%] translate-x-[-50%]" style={{padding:"0.5rem"}} variation="minimal" saveUserChoices={true}/>
      <Settings className="absolute opacity-50 right-2 bottom-4" width={12} height={12} onClick={()=>handleOpenModalToEditName()} />
    </LiveKitRoom>
  )
}

function MyVideoConference({isAdmin, roomName }: { isAdmin: boolean, roomName: string }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const adminScreenShareTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.participant.identity.toLowerCase().includes("admin")
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrackRef, setSelectedTrackRef] = useState<TrackReference | null>(null);

  const handleParticipantClick = (event: ParticipantClickEvent) => {
    if (event.track) {
      setSelectedTrackRef({
        participant: event.participant,
        publication: event.track,
        source: event.track.source,
      });
    }
  };
  
  useEffect(() => {
    setIsDialogOpen(!!selectedTrackRef);
  }, [selectedTrackRef]);
  
  const handleCloseModal = () => {
    setSelectedTrackRef(null);
  };

  // Função para expulsar participante
  async function kickParticipant(room: string, identity: string) {
    try {
      const resp = await fetch("/api/kick-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, identity } as KickParticipantRequest),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Erro ao expulsar participante");
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Erro ao expulsar participante");
      }
    }
  }

  // Função para mutar track
  async function muteTrack(room: string, identity: string, trackSid: string, muted: boolean) {
    try {
      const resp = await fetch("/api/mute-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, identity, trackSid, muted } as MuteTrackRequest),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Erro ao mutar track");
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Erro ao expulsar participante");
      }
    }
  }

  const roomContext = useRoomContext();

  // Habilita o filtro de ruído Krisp para o microfone local
  useEffect(() => {
    if (!roomContext) return;
    if (!isAdmin) return;

    const handleLocalTrackPublished = async (trackPublication: LocalTrackPublication) => {
      if (
        trackPublication.source === Track.Source.Microphone &&
        trackPublication.track instanceof LocalAudioTrack
      ) {
        const { KrispNoiseFilter, isKrispNoiseFilterSupported } = await import('@livekit/krisp-noise-filter');

        if (!isKrispNoiseFilterSupported()) {
          console.warn('Krisp noise filter is not supported on this browser');
          return;
        }

        try {
          // Cria um AudioContext se ainda não existir
          const audioContext = new AudioContext();

          // Define o contexto de áudio necessário
          trackPublication.track.setAudioContext(audioContext);

          const krispProcessor = KrispNoiseFilter();
          console.log('Enabling LiveKit Krisp noise filter');

          await trackPublication.track.setProcessor(krispProcessor);
          await krispProcessor.setEnabled(true);
        } catch (err) {
          console.error('Failed to enable Krisp noise filter', err);
        }
      }
    };

    roomContext.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);

    return () => {
      roomContext.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    };
  }, [roomContext, isAdmin]);


  const [hasLeft, setHasLeft] = useState(false);

  useEffect(() => {
    if (!roomContext) return;
    const onDisconnect = () => setHasLeft(true);
    roomContext.on('disconnected', onDisconnect);
    return () => {
      roomContext.off('disconnected', onDisconnect);
    };
  }, [roomContext]);

  if (hasLeft) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-8">Você saiu da reunião</h1>
        <Button
          size="lg"
          onClick={() => window.location.reload()}
          className="text-lg px-8 py-4"
        >
          Voltar à reunião
        </Button>
      </div>
    );
  }

  return (
    <>
      {adminScreenShareTrack && !isAdmin && (
        <div className="absolute top-4 left-4 z-[100]">
          <CastButton />
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={()=>handleCloseModal()}>
        <DialogContent className="text-white bg-[#373737] min-w-[576px] max-w-xl lg:max-w-4xl max-h-full p-4 gap-1 rotate-90 sm:rotate-0 ">
          <DialogDescription>
            câmera em foco:
          </DialogDescription>
          <DialogTitle></DialogTitle>
          {selectedTrackRef && (
            <ParticipantTile
              className="w-full aspect-video h-full p-0"
              trackRef={selectedTrackRef}
            />
          )}
        </DialogContent>
      </Dialog>
      <GridLayout tracks={tracks} style={{ height: '100vh' }}>
        {isAdmin
          ? <ParticipantTileWithAdminOptions onParticipantClick={handleParticipantClick} isAdmin={isAdmin} roomName={roomName} kickParticipant={kickParticipant} muteTrack={muteTrack} />
          : <ParticipantTile onParticipantClick={handleParticipantClick} />
        }
      </GridLayout>
    </>
  )
}
