"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Cloud, CloudLightning, Droplets, Flame, Leaf, Waves, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type Mood = {
  name: string
  icon: React.ReactNode
  color: string
  bgClass: string
  soundFile: string
}

export default function MoodSoundboard() {
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const moods: Mood[] = [
    {
      name: "Thunder",
      icon: <CloudLightning size={32} />,
      color: "bg-purple-500",
      bgClass: "bg-gradient-to-br from-slate-900 to-purple-900",
      soundFile: "/sounds/thunder.mp3",
    },
    {
      name: "Ocean",
      icon: <Waves size={32} />,
      color: "bg-blue-500",
      bgClass: "bg-gradient-to-br from-blue-400 to-blue-800",
      soundFile: "/sounds/ocean.mp3",
    },
    {
      name: "Rain",
      icon: <Droplets size={32} />,
      color: "bg-sky-500",
      bgClass: "bg-gradient-to-br from-gray-400 to-sky-700",
      soundFile: "/sounds/rain.mp3",
    },
    {
      name: "Forest",
      icon: <Leaf size={32} />,
      color: "bg-green-500",
      bgClass: "bg-gradient-to-br from-green-300 to-green-800",
      soundFile: "/sounds/forest.mp3",
    },
    {
      name: "Fireplace",
      icon: <Flame size={32} />,
      color: "bg-orange-500",
      bgClass: "bg-gradient-to-br from-orange-300 to-red-800",
      soundFile: "/sounds/fireplace.mp3",
    },
    {
      name: "Meditation",
      icon: <Cloud size={32} />,
      color: "bg-indigo-500",
      bgClass: "bg-gradient-to-br from-indigo-300 to-indigo-900",
      soundFile: "/sounds/meditation.mp3",
    },
  ]

  useEffect(() => {
    // Preload audio files
    moods.forEach((mood) => {
      const audio = new Audio(mood.soundFile)
      audio.loop = true
      audio.volume = volume
      audioRefs.current[mood.name] = audio
    })

    return () => {
      // Cleanup audio on unmount
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [])

  useEffect(() => {
    // Update volume for all audio elements
    Object.values(audioRefs.current).forEach((audio) => {
      audio.volume = muted ? 0 : volume
    })
  }, [volume, muted])

  const handleMoodClick = (mood: Mood) => {
    // Stop all currently playing sounds
    Object.entries(audioRefs.current).forEach(([name, audio]) => {
      if (name !== mood.name) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    if (activeMood === mood.name) {
      // If clicking the active mood, stop it
      audioRefs.current[mood.name].pause()
      audioRefs.current[mood.name].currentTime = 0
      setActiveMood(null)
    } else {
      // Play the new mood
      const audio = audioRefs.current[mood.name]
      audio.volume = muted ? 0 : volume
      audio.play().catch((e) => console.error("Audio playback error:", e))
      setActiveMood(mood.name)
    }
  }

  const toggleMute = () => {
    setMuted(!muted)
  }

  return (
    <main
      className={cn(
        "min-h-screen flex flex-col items-center justify-center transition-all duration-1000 p-4",
        activeMood ? moods.find((m) => m.name === activeMood)?.bgClass : "bg-gradient-to-br from-gray-100 to-gray-300",
      )}
    >
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">Mood Soundboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {moods.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handleMoodClick(mood)}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-full aspect-square transition-all",
                mood.color,
                activeMood === mood.name
                  ? "ring-4 ring-white shadow-lg scale-105"
                  : "opacity-90 hover:opacity-100 hover:scale-105",
                activeMood === mood.name && "animate-pulse",
              )}
            >
              <div className="text-white mb-2">{mood.icon}</div>
              <span className="text-white font-medium">{mood.name}</span>

              {activeMood === mood.name && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full animate-waveform"
                        style={{
                          height: `${Math.random() * 16 + 8}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg flex items-center space-x-4 max-w-md mx-auto">
          <button onClick={toggleMute} className="text-white">
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <Slider
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="flex-1"
          />
        </div>

        {activeMood && (
          <div className="mt-12 text-center text-white/80">
            <p>
              Currently playing: <span className="font-bold">{activeMood}</span>
            </p>
            <p className="mt-2 text-sm">Click the same mood again to stop the sound</p>
          </div>
        )}
      </div>
    </main>
  )
}
