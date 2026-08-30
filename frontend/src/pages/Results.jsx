import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Results() {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)

  useEffect(() => {
    const storedResults = sessionStorage.getItem("interviewResults")

    if (storedResults) {
      try {
        setResults(JSON.parse(storedResults))
      } catch (error) {
        console.error("Failed to parse interview results:", error)
      }
    }
  }, [])

  if (!results) {
    return (
      <div className="min-h-screen bg-[#15111d] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">
            No interview results found.
          </h1>

          <p className="text-gray-400">
            Complete an interview to see your analysis.
          </p>
        </div>
      </div>
    )
  }

  const video = results.video_analysis || {}
  const speech = results.speech_analysis || {}
  const prosody = speech.prosody || {}

  const engagement = Number(video.average_engagement || 0)

  const formatNumber = (value, decimals = 1) => {
    const number = Number(value)

    if (Number.isNaN(number)) return "—"

    return number.toFixed(decimals)
  }

  const getEngagementFeedback = () => {
    if (engagement >= 80) {
      return "Excellent engagement. You maintained a strong visual presence throughout the interview."
    }

    if (engagement >= 60) {
      return "Good engagement. There is room to make your visual presence stronger."
    }

    return "Your visual engagement could be improved. Try maintaining more consistent eye contact."
  }

  const getSpeechFeedback = () => {
    const wpm = Number(speech.words_per_minute || 0)

    if (wpm === 0) {
      return "Speech information could not be measured."
    }

    if (wpm < 120) {
      return "Your speaking pace is slightly slow. Try maintaining a more natural interview rhythm."
    }

    if (wpm <= 180) {
      return "Your speaking pace is within a comfortable interview range."
    }

    return "Your speaking pace is quite fast. Try slowing down slightly for clearer communication."
  }

  const MetricCard = ({
    title,
    value,
    description,
    status = "good",
  }) => {
    return (
      <div className="bg-[#292236] border border-[#403650] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#c6b8dd] text-sm">
            {title}
          </p>

          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === "warning"
                ? "bg-[#e5a88f]"
                : "bg-[#91c9ad]"
            }`}
          />
        </div>

        <h3 className="text-3xl font-semibold mb-2">
          {value}
        </h3>

        <p className="text-[#b7aac9] text-xs">
          {description}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#15111d] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="h-[72px] border-b border-[#30283b] bg-[#1c1725]">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#292236] border border-[#403650] flex items-center justify-center text-[#c6a4ff] text-xl">
              ✦
            </div>

            <h1 className="text-xl font-semibold">
              SkillMirror
            </h1>

          </div>

          <p className="text-sm text-[#b9adca]">
            Interview Results
          </p>

        </div>
      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* HEADER */}

        <section className="mb-10">

          <p className="uppercase tracking-[0.25em] text-sm text-[#c39cff] font-medium mb-4">
            Performance Review
          </p>

          <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-4">
            Your interview,{" "}
            <span className="text-[#b994ef]">
              reflected back.
            </span>
          </h1>

          <p className="text-lg text-[#b7aac9] max-w-3xl leading-relaxed">
            SkillMirror analyzed your speech, visual presence,
            and engagement to help you understand how you performed.
          </p>

        </section>


        {/* =====================================================
            OVERALL PERFORMANCE
        ====================================================== */}

        <section className="bg-[#292236] border border-[#403650] rounded-3xl p-8 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>

              <p className="uppercase tracking-[0.2em] text-xs text-[#bda8dc] mb-4">
                Overall Performance
              </p>

              <h2 className="text-3xl font-semibold mb-3">
                Interview Analysis Complete
              </h2>

              <p className="text-[#b7aac9]">
                Your recording was successfully processed across
                video and speech signals.
              </p>

            </div>


            {/* Engagement Circle */}

            <div className="flex-shrink-0">

              <div className="w-32 h-32 rounded-full border-4 border-[#b996e8] flex flex-col items-center justify-center">

                <span className="text-4xl font-semibold text-[#d0b7f5]">
                  {Math.round(engagement)}
                </span>

                <span className="text-xs uppercase tracking-wide text-[#b7aac9]">
                  Engagement
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            VISUAL PRESENCE
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-2">
              01 · Visual Presence
            </p>

            <h2 className="text-2xl font-semibold">
              How you appeared
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <MetricCard
              title="Face Detection"
              value={`${formatNumber(video.face_detection_percentage, 0)}%`}
              description="Face visible during interview"
            />

            <MetricCard
              title="Eyes Open"
              value={`${formatNumber(video.eye_open_percentage)}%`}
              description="Estimated eye openness"
            />

            <MetricCard
              title="Forward Looking"
              value={`${formatNumber(video.forward_looking_percentage)}%`}
              description="Forward-facing attention"
              status={
                Number(video.forward_looking_percentage || 0) < 30
                  ? "warning"
                  : "good"
              }
            />

            <MetricCard
              title="Engagement"
              value={`${formatNumber(video.average_engagement)}%`}
              description="Overall visual engagement"
            />

          </div>


          {/* Visual Feedback */}

          <div className="mt-4 bg-[#211b2c] border border-[#403650] rounded-2xl p-5 flex gap-4">

            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#302742] flex items-center justify-center text-[#c6a4ff]">
              ✦
            </div>

            <div>

              <h3 className="font-semibold mb-1">
                Visual feedback
              </h3>

              <p className="text-sm text-[#b7aac9]">
                {getEngagementFeedback()}
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            SPEECH
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-2">
              02 · Speech
            </p>

            <h2 className="text-2xl font-semibold">
              How you communicated
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <MetricCard
              title="Word Count"
              value={speech.word_count || 0}
              description="Words detected"
            />

            <MetricCard
              title="Speaking Pace"
              value={`${Math.round(Number(speech.words_per_minute || 0))} WPM`}
              description="Words per minute"
            />

            <MetricCard
              title="Filler Words"
              value={speech.total_fillers || 0}
              description="Detected fillers"
            />

            <MetricCard
              title="Pauses"
              value={speech.pause_count || 0}
              description="Detected pauses"
            />

          </div>


          {/* Speech Feedback */}

          <div className="mt-4 bg-[#211b2c] border border-[#403650] rounded-2xl p-5 flex gap-4">

            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#302742] flex items-center justify-center text-[#c6a4ff]">
              ✦
            </div>

            <div>

              <h3 className="font-semibold mb-1">
                Speech feedback
              </h3>

              <p className="text-sm text-[#b7aac9]">
                {getSpeechFeedback()}
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            VOCAL DELIVERY
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-2">
              03 · Voice
            </p>

            <h2 className="text-2xl font-semibold">
              Your vocal delivery
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <MetricCard
              title="Average Pitch"
              value={`${formatNumber(prosody.average_pitch_hz)} Hz`}
              description="Average vocal pitch"
            />

            <MetricCard
              title="Pitch Variation"
              value={`${formatNumber(prosody.pitch_variation_hz)} Hz`}
              description="Vocal variation"
            />

            <MetricCard
              title="Average Energy"
              value={formatNumber(prosody.average_energy, 3)}
              description="Voice energy"
            />

            <MetricCard
              title="Energy Variation"
              value={formatNumber(prosody.energy_variation, 3)}
              description="Delivery variation"
            />

          </div>

        </section>


        {/* =====================================================
            TRANSCRIPT
        ====================================================== */}

        <section className="mb-10">

          <div className="mb-5">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-2">
              04 · Transcript
            </p>

            <h2 className="text-2xl font-semibold">
              What you said
            </h2>

          </div>


          <div className="bg-[#292236] border border-[#403650] rounded-3xl p-7">

            <p className="text-[#d1c7dc] leading-relaxed text-lg">
              {speech.transcript || "No transcript available."}
            </p>

          </div>

        </section>


        {/* =====================================================
            ADDITIONAL SPEECH DETAILS
        ====================================================== */}

        <section className="mb-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <MetricCard
              title="Audio Duration"
              value={`${formatNumber(speech.audio_duration)}s`}
              description="Total recorded audio"
            />

            <MetricCard
              title="Speaking Duration"
              value={`${formatNumber(speech.speaking_duration)}s`}
              description="Time spent speaking"
            />

            <MetricCard
              title="Longest Pause"
              value={`${formatNumber(speech.longest_pause)}s`}
              description="Longest detected pause"
            />

          </div>

        </section>


        {/* =====================================================
            BUTTONS
        ====================================================== */}

        <div className="border-t border-[#3a3145] pt-8 flex flex-col sm:flex-row gap-4">

          <button
  onClick={() => {
    sessionStorage.removeItem("interviewResults")
    navigate("/setup")
  }}
  className="px-7 py-4 rounded-xl bg-[#b896e8] text-[#1a1422] font-medium hover:bg-[#c8aaf0] transition"
>
  Practice Again →
</button>

          <button
            onClick={() => {
              window.location.href = "/"
            }}
            className="px-7 py-4 rounded-xl bg-[#30283b] text-white font-medium hover:bg-[#3b3148] transition border border-[#403650]"
          >
            Back to Home
          </button>

        </div>

      </main>

    </div>
  )
}

export default Results