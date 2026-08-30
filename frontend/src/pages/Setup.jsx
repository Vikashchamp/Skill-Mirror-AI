import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function Setup() {
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [error, setError] = useState("")
  const [selectedType, setSelectedType] = useState("Behavioral")

  useEffect(() => {
    startDevices()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startDevices = async () => {
    try {
      setError("")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      setCameraReady(!!videoTrack)
      setMicReady(!!audioTrack)
    } catch (err) {
      console.error(err)

      setCameraReady(false)
      setMicReady(false)

      setError(
        "Camera and microphone access is required to start the interview."
      )
    }
  }

  const handleStartInterview = () => {
    if (!cameraReady || !micReady) {
      setError("Please enable your camera and microphone first.")
      return
    }

    navigate("/interview", {
      state: {
        interviewType: selectedType,
      },
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17131F] text-[#F5F1F8]">

      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#B99AE8]/10
          blur-[120px]
          animate-soft-glow
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-10
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#C98FA8]/8
          blur-[120px]
        "
      />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[#3A3046]
              bg-[#282033]
              text-[#D5C2F4]
              shadow-[0_0_25px_rgba(185,154,232,0.12)]
            "
          >
            ✦
          </div>

          <span className="font-['Manrope'] text-lg font-bold">
            SkillMirror
          </span>
        </button>

        <div className="text-sm text-[#B9B0C2]">
          Interview Setup
        </div>

      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-8 lg:px-10">

        {/* Heading */}
        <div className="animate-fade-up">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B99AE8]">
            Step 01 · Prepare
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Get ready for your interview.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#B9B0C2] sm:text-lg">
            Choose your interview style and make sure your camera and
            microphone are ready before you begin.
          </p>

        </div>

        {/* Content */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* Camera preview */}
          <div
            className="
              glass-card
              overflow-hidden
              rounded-3xl
              p-4
              animate-scale-in
            "
          >

            <div className="mb-4 flex items-center justify-between px-2">

              <div>
                <p className="font-['Manrope'] font-semibold">
                  Camera preview
                </p>

                <p className="mt-1 text-sm text-[#B9B0C2]">
                  Make sure you're clearly visible.
                </p>
              </div>

              <div
                className={`
                  flex items-center gap-2
                  rounded-full
                  border
                  px-3 py-1.5
                  text-xs font-medium
                  ${
                    cameraReady
                      ? "border-[#91B7A1]/30 bg-[#91B7A1]/10 text-[#91B7A1]"
                      : "border-[#D9A38F]/30 bg-[#D9A38F]/10 text-[#D9A38F]"
                  }
                `}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    cameraReady
                      ? "bg-[#91B7A1]"
                      : "bg-[#D9A38F]"
                  }`}
                />

                {cameraReady ? "Camera ready" : "Camera unavailable"}
              </div>

            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#3A3046] bg-[#211A2B]">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
              />className="h-full w-full object-contain bg-[#211A2B]"

              {!cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#211A2B]">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#3A3046] bg-[#282033] text-2xl text-[#B99AE8]">
                    ◉
                  </div>

                  <p className="mt-4 text-sm text-[#B9B0C2]">
                    Camera preview unavailable
                  </p>

                </div>
              )}

              {/* Preview label */}
              {cameraReady && (
                <div className="absolute bottom-4 left-4 rounded-lg border border-[#3A3046] bg-[#17131F]/80 px-3 py-2 text-xs text-[#B9B0C2] backdrop-blur-md">
                  Live preview
                </div>
              )}

            </div>

          </div>

          {/* Settings */}
          <div className="space-y-5 animate-fade-up">

            {/* Interview type */}
            <div className="glass-card rounded-3xl p-6">

              <p className="text-sm font-semibold uppercase tracking-wider text-[#B9B0C2]">
                Interview type
              </p>

              <div className="mt-4 space-y-3">

                {["Behavioral", "Technical"].map((type) => {

                  const selected = selectedType === type

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`
                        w-full
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition-all
                        duration-200
                        ${
                          selected
                            ? "border-[#B99AE8]/60 bg-[#B99AE8]/10 shadow-[0_0_25px_rgba(185,154,232,0.08)]"
                            : "border-[#3A3046] bg-[#282033] hover:border-[#B99AE8]/30 hover:bg-[#30273D]"
                        }
                      `}
                    >

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="font-['Manrope'] font-semibold">
                            {type}
                          </p>

                          <p className="mt-1 text-sm text-[#B9B0C2]">
                            {type === "Behavioral"
                              ? "Experience, communication and situational questions"
                              : "Role-specific knowledge and problem solving"}
                          </p>
                        </div>

                        <div
                          className={`
                            flex h-5 w-5 items-center justify-center rounded-full border
                            ${
                              selected
                                ? "border-[#B99AE8] bg-[#B99AE8]"
                                : "border-[#3A3046]"
                            }
                          `}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-[#17131F]" />
                          )}
                        </div>

                      </div>

                    </button>
                  )
                })}

              </div>

            </div>

            {/* Device status */}
            <div className="glass-card rounded-3xl p-6">

              <p className="text-sm font-semibold uppercase tracking-wider text-[#B9B0C2]">
                Device check
              </p>

              <div className="mt-4 space-y-3">

                <DeviceStatus
                  icon="◉"
                  title="Camera"
                  description="Video input"
                  ready={cameraReady}
                />

                <DeviceStatus
                  icon="◌"
                  title="Microphone"
                  description="Audio input"
                  ready={micReady}
                />

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-[#D9A38F]/30 bg-[#D9A38F]/10 px-4 py-3 text-sm leading-6 text-[#D9A38F]">
                {error}
              </div>
            )}

            {/* Start */}
            <button
              onClick={handleStartInterview}
              disabled={!cameraReady || !micReady}
              className={`
                w-full
                rounded-2xl
                px-6
                py-4
                font-['Manrope']
                font-bold
                transition-all
                duration-300
                ${
                  cameraReady && micReady
                    ? "primary-button"
                    : "cursor-not-allowed border border-[#3A3046] bg-[#30273D] text-[#B9B0C2]"
                }
              `}
            >
              {cameraReady && micReady
                ? "Enter Interview →"
                : "Waiting for devices..."}
            </button>

            <p className="text-center text-xs leading-5 text-[#B9B0C2]">
              Your camera and microphone are used during the interview
              for performance analysis.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}

function DeviceStatus({ icon, title, description, ready }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#3A3046] bg-[#282033] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#30273D] text-[#B99AE8]">
          {icon}
        </div>

        <div>
          <p className="font-medium">
            {title}
          </p>

          <p className="text-xs text-[#B9B0C2]">
            {description}
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2 text-sm">

        <span
          className={`h-2 w-2 rounded-full ${
            ready ? "bg-[#91B7A1]" : "bg-[#D9A38F]"
          }`}
        />

        <span
          className={
            ready
              ? "text-[#91B7A1]"
              : "text-[#D9A38F]"
          }
        >
          {ready ? "Ready" : "Not ready"}
        </span>

      </div>

    </div>
  )
}

export default Setup