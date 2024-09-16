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
  useTracks,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Track } from "livekit-client"
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader,
  Settings
} from 'lucide-react';

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
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar className="absolute bottom-10 bg-[#0F0F0F] rounded-lg left-[50%] translate-x-[-50%]" style={{padding:"0.5rem"}} variation="minimal" saveUserChoices={true}/>
      <Settings className="absolute opacity-50 right-2 bottom-4" width={12} height={12} onClick={()=>handleOpenModalToEditName()} />
    </LiveKitRoom>
  )
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

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

  return (
    <>
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
        <ParticipantTile onParticipantClick={handleParticipantClick} />
      </GridLayout>
    </>
  )
}
