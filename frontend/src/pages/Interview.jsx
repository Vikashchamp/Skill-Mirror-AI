import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

function Interview() {
  const navigate = useNavigate()
  const location = useLocation()

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  const [time, setTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [recordingReady, setRecordingReady] = useState(false)

  const interviewType =
    location.state?.interviewType || "Behavioral"

  const question =
    interviewType === "Technical"
      ? "Tell me about a technical problem you solved recently."
      : "Tell me about yourself and your professional background."

  // --------------------------------------------------
  // START CAMERA + MICROPHONE
  // --------------------------------------------------

  useEffect(() => {
    startCamera()

    return () => {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop()
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraReady(true)

      console.log("Camera and microphone ready")
    } catch (error) {
      console.error("Camera/microphone error:", error)
      setCameraReady(false)
    }
  }

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!isRecording || isPaused) return

    const interval = setInterval(() => {
      setTime((previous) => previous + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // --------------------------------------------------
  // START RECORDING
  // --------------------------------------------------

  const startRecording = () => {
    if (!streamRef.current) {
      console.error("No camera/microphone stream available")
      return
    }

    recordedChunksRef.current = []

    let options = {
      mimeType: "video/webm;codecs=vp9,opus",
    }

    // Some browsers may not support VP9.
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = {
        mimeType: "video/webm;codecs=vp8,opus",
      }
    }

    // Final fallback.
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = {
        mimeType: "video/webm",
      }
    }

    const recorder = new MediaRecorder(
      streamRef.current,
      options
    )

    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(
        recordedChunksRef.current,
        {
          type: recorder.mimeType || "video/webm",
        }
      )

      console.log("Recording completed")
      console.log("Recording size:", blob.size, "bytes")
      console.log("Recording type:", blob.type)

      // Store a temporary URL so we can use the recording later.
      const recordingUrl = URL.createObjectURL(blob)

      console.log("Recording URL:", recordingUrl)

      setRecordingReady(true)

      // Save the blob for the next stage.
      window.skillMirrorRecording = blob
    }

    recorder.start(1000)

    setIsRecording(true)
    setIsPaused(false)
    setRecordingReady(false)

    console.log("Recording started")
  }

  // --------------------------------------------------
  // PAUSE / RESUME
  // --------------------------------------------------

  const togglePause = () => {
    const recorder = mediaRecorderRef.current

    if (!recorder) return

    if (recorder.state === "recording") {
      recorder.pause()

      setIsPaused(true)

      console.log("Recording paused")
    } else if (recorder.state === "paused") {
      recorder.resume()

      setIsPaused(false)

      console.log("Recording resumed")
    }
  }

  // --------------------------------------------------
  // STOP RECORDING
  // --------------------------------------------------

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current

    if (!recorder) return

    if (recorder.state !== "inactive") {
      recorder.stop()
    }

    setIsRecording(false)
    setIsPaused(false)

    console.log("Recording stopped")
  }

  // --------------------------------------------------
  // END INTERVIEW
  // --------------------------------------------------

  const endInterview = () => {
    // Stop recording first if it is active.
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
    }

    // Stop camera and microphone.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }

    setIsRecording(false)
    setIsPaused(false)

    navigate("/results")
  }

  // --------------------------------------------------
  // FORMAT TIMER
  // --------------------------------------------------

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#17131F] text-[#F5F1F8]">

      {/* Header */}
      <header className="border-b border-[#3A3046] bg-[#211A2B]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3A3046] bg-[#282033] text-[#D5C2F4]">
              ✦
            </div>

            <span className="font-['Manrope'] text-lg font-bold">
              SkillMirror
            </span>

          </button>

          <div className="flex items-center gap-4">

            <div className="rounded-full border border-[#3A3046] bg-[#282033] px-4 py-2 text-sm text-[#B9B0C2]">
              {interviewType} Interview
            </div>

            <div className="flex items-center gap-2 text-sm">

              <span
                className={`h-2 w-2 rounded-full ${
                  cameraReady
                    ? "bg-[#91B7A1]"
                    : "bg-[#D9A38F]"
                }`}
              />

              {cameraReady ? "Connected" : "Disconnected"}

            </div>

          </div>

        </div>

      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-6">

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">

          {/* Video */}
          <div className="glass-card overflow-hidden rounded-3xl p-4">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#B99AE8]">
                  Live interview
                </p>

                <h1 className="mt-1 text-xl font-bold">
                  Your interview
                </h1>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#3A3046] bg-[#282033] px-4 py-2">

                <span
                  className={`h-2 w-2 rounded-full ${
                    isRecording && !isPaused
                      ? "animate-pulse bg-[#C98FA8]"
                      : isPaused
                      ? "bg-[#D9A38F]"
                      : "bg-[#B9B0C2]"
                  }`}
                />

                <span className="text-sm text-[#B9B0C2]">

                  {isRecording
                    ? isPaused
                      ? "Paused"
                      : "Recording"
                    : recordingReady
                    ? "Recording Ready"
                    : "Ready"}

                </span>

              </div>

            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#3A3046] bg-[#211A2B]">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-contain bg-[#211A2B]"
              />

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-[#B9B0C2]">
                  Camera unavailable
                </div>
              )}

              {/* Timer */}
              <div className="absolute left-4 top-4 rounded-lg border border-[#3A3046] bg-[#17131F]/80 px-3 py-2 font-mono text-sm backdrop-blur-md">
                {formatTime(time)}
              </div>

            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between">

              <div className="text-sm text-[#B9B0C2]">

                {isRecording
                  ? isPaused
                    ? "Recording paused."
                    : "Your response is being recorded."
                  : "Speak naturally and take your time."}

              </div>

              <div className="flex items-center gap-3">

                {!isRecording ? (

                  <button
                    onClick={startRecording}
                    className="primary-button rounded-xl px-5 py-3 font-semibold transition-all"
                  >
                    {recordingReady
                      ? "Record Again"
                      : "Start Recording"}
                  </button>

                ) : (

                  <button
                    onClick={togglePause}
                    className="rounded-xl border border-[#C98FA8]/40 bg-[#C98FA8]/10 px-5 py-3 font-semibold text-[#C98FA8] transition-all hover:bg-[#C98FA8]/20"
                  >
                    {isPaused
                      ? "Resume Recording"
                      : "Pause Recording"}
                  </button>

                )}

                <button
                  onClick={endInterview}
                  className="rounded-xl border border-[#3A3046] bg-[#30273D] px-5 py-3 font-semibold transition hover:border-[#C98FA8]/40 hover:text-[#C98FA8]"
                >
                  End Interview
                </button>

              </div>

            </div>

          </div>

          {/* Question panel */}
          <aside className="space-y-5">

            <div className="glass-card rounded-3xl p-6">

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B99AE8]">
                Question 01
              </p>

              <h2 className="mt-5 text-2xl font-bold leading-tight">
                {question}
              </h2>

              <p className="mt-5 text-sm leading-6 text-[#B9B0C2]">
                Take a moment to think about your answer. Focus on being
                clear, confident, and conversational.
              </p>

            </div>

            {/* Analysis status */}
            <div className="glass-card rounded-3xl p-6">

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B9B0C2]">
                Live analysis
              </p>

              <div className="mt-5 space-y-4">

                <AnalysisItem
                  label="Speech"
                  status={
                    isRecording
                      ? isPaused
                        ? "Paused"
                        : "Listening"
                      : "Waiting"
                  }
                />

                <AnalysisItem
                  label="Engagement"
                  status={
                    isRecording
                      ? isPaused
                        ? "Paused"
                        : "Tracking"
                      : "Waiting"
                  }
                />

                <AnalysisItem
                  label="Video"
                  status={
                    cameraReady
                      ? "Active"
                      : "Waiting"
                  }
                />

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  )
}

function AnalysisItem({ label, status }) {
  const active =
    status === "Listening" ||
    status === "Tracking" ||
    status === "Active"

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#3A3046] bg-[#282033] px-4 py-3">

      <span className="text-sm text-[#B9B0C2]">
        {label}
      </span>

      <div className="flex items-center gap-2 text-sm">

        <span
          className={`h-2 w-2 rounded-full ${
            active
              ? "bg-[#91B7A1]"
              : "bg-[#B9B0C2]"
          }`}
        />

        <span
          className={
            active
              ? "text-[#91B7A1]"
              : "text-[#B9B0C2]"
          }
        >
          {status}
        </span>

      </div>

    </div>
  )
}

export default Interview