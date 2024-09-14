'use client'

import { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Track } from "livekit-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Page() {
  const room = "quickstart-room"
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [initialAudioState, setInitialAudioState] = useState(false)
  const [initialVideoState, setInitialVideoState] = useState(false)

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
        `/api/get-participant-token?room=${room}&username=${username}`
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
      setIsDialogOpen(false)
      generateToken(uniqueName)
    }
  }

  if (token === "") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (name.trim() !== "") {
            setIsDialogOpen(open)
          }
        }}>
          <DialogContent className="text-white">
            <DialogHeader>
              <DialogTitle >Digite seu nome:</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNameSubmit}>
              <div className="grid gap-4 py-4">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <DialogFooter >
                <Button type="submit">Entrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {!isDialogOpen && <div>Carregando...</div>}
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={initialVideoState}
      audio={initialAudioState}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      <MyVideoConference setInitialAudioState={setInitialAudioState} setInitialVideoState={setInitialVideoState} />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  )
}

function MyVideoConference({ setInitialAudioState, setInitialVideoState } :
  {
    setInitialAudioState: Dispatch<SetStateAction<boolean>>,
    setInitialVideoState: Dispatch<SetStateAction<boolean>>
  }
) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )
  
  const participants = useParticipants()

  useEffect(() => {
    if (participants.length <= 1) {
      setInitialAudioState(true)
      setInitialVideoState(true)
    } else {
      setInitialAudioState(false)
      setInitialVideoState(false)
    }
  }, [participants, setInitialAudioState, setInitialVideoState])

  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  )
}
