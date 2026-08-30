import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

function Results() {
  const navigate = useNavigate()
  const location = useLocation()

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ============================================================
  // NORMALIZE BACKEND / HISTORY DATA
  // ============================================================

  const normalizeResults = (data) => {
    if (!data) return null

    // Already in normal interview-result format
    if (data.video_analysis || data.speech_analysis) {
      return data
    }

    // Flattened interview-history format
    return {
      status: "success",
      interview_id: data.id,
      user_id: data.user_id,

      video_analysis: {
        duration_seconds: 0,
        face_detection_percentage: 0,
        eye_open_percentage: 0,
        forward_looking_percentage: 0,
        average_engagement: Number(data.engagement_score || 0),
      },

      speech_analysis: {
        transcript: data.transcript || "",
        word_count: Number(data.word_count || 0),
        words_per_minute: Number(data.words_per_minute || 0),
        filler_words: {},
        total_fillers: Number(data.total_fillers || 0),
        pause_count: Number(data.pause_count || 0),
        average_pause: Number(data.average_pause || 0),
        longest_pause: Number(data.longest_pause || 0),

        audio_duration: Number(data.audio_duration || 0),
        speaking_duration: Number(data.speaking_duration || 0),

        prosody: {
          average_pitch_hz: Number(data.average_pitch || 0),
          pitch_variation_hz: Number(data.pitch_variation || 0),
          minimum_pitch_hz: 0,
          maximum_pitch_hz: 0,
          average_energy: Number(data.average_energy || 0),
          energy_variation: Number(data.energy_variation || 0),
          zero_crossing_rate: 0,
        },
      },
    }
  }

  // ============================================================
  // LOAD RESULTS
  // ============================================================

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true)
      setError("")

      try {
        // --------------------------------------------------------
        // 1. Check if History page passed an interview
        // --------------------------------------------------------

        if (location.state?.interview) {
          const normalized = normalizeResults(location.state.interview)

          setResults(normalized)
          setLoading(false)
          return
        }

        // --------------------------------------------------------
        // 2. Check URL for interview_id
        // Example:
        // /results?interview_id=1
        // --------------------------------------------------------

        const params = new URLSearchParams(location.search)
        const interviewId = params.get("interview_id")

        if (interviewId) {
          const userData = sessionStorage.getItem("skillmirrorUser")

          if (!userData) {
            navigate("/login")
            return
          }

          const user = JSON.parse(userData)

          const response = await fetch(
            `http://127.0.0.1:8000/interview-history/${user.user_id}`
          )

          if (!response.ok) {
            throw new Error("Unable to load interview history.")
          }

          const data = await response.json()

          if (data.status !== "success") {
            throw new Error(
              data.message || "Unable to load interview history."
            )
          }

          const selectedInterview = (data.interviews || []).find(
            (interview) =>
              String(interview.id) === String(interviewId)
          )

          if (!selectedInterview) {
            throw new Error("Interview result not found.")
          }

          setResults(normalizeResults(selectedInterview))
          setLoading(false)
          return
        }

        // --------------------------------------------------------
        // 3. Normal current-interview result
        // --------------------------------------------------------

        const storedResults =
          sessionStorage.getItem("interviewResults")

        if (storedResults) {
          const parsedResults = JSON.parse(storedResults)

          setResults(normalizeResults(parsedResults))
        } else {
          setResults(null)
        }
      } catch (err) {
        console.error("Failed to load results:", err)

        setError(
          err.message ||
            "Unable to load interview results."
        )
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [location.state, location.search, navigate])

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15111d] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full border-4 border-[#3a3046] border-t-[#b896e8] animate-spin" />

          <h1 className="text-2xl font-semibold">
            Loading interview results...
          </h1>

          <p className="text-[#9f92ae] mt-2">
            Preparing your performance review.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#15111d] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#292236] border border-[#403650] flex items-center justify-center text-[#c6a4ff] text-2xl">
            ✦
          </div>

          <h1 className="text-3xl font-semibold mb-3">
            Unable to load results
          </h1>

          <p className="text-[#9f92ae] mb-7">
            {error}
          </p>

          <button
            onClick={() => navigate("/history")}
            className="px-6 py-3 rounded-xl bg-[#b896e8] text-[#1a1422] font-semibold hover:bg-[#c8aaf0] transition"
          >
            Back to History
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // NO RESULTS
  // ============================================================

  if (!results) {
    return (
      <div className="min-h-screen bg-[#15111d] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#292236] border border-[#403650] flex items-center justify-center text-[#c6a4ff] text-2xl">
            ✦
          </div>

          <h1 className="text-3xl font-bold mb-3">
            No interview results found.
          </h1>

          <p className="text-[#9f92ae] mb-7">
            Complete an interview to see your analysis.
          </p>

          <button
            onClick={() => navigate("/setup")}
            className="px-6 py-3 rounded-xl bg-[#b896e8] text-[#1a1422] font-semibold hover:bg-[#c8aaf0] transition"
          >
            Start Interview
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // DATA
  // ============================================================

  const video = results.video_analysis || {}
  const speech = results.speech_analysis || {}
  const prosody = speech.prosody || {}

  const engagement = Number(
    video.average_engagement || 0
  )

  const faceScore = Number(
    video.face_detection_percentage || 0
  )

  const eyeScore = Number(
    video.eye_open_percentage || 0
  )

  const forwardScore = Number(
    video.forward_looking_percentage || 0
  )

  const engagementScore = Number(
    video.average_engagement || 0
  )

  const wpm = Number(
    speech.words_per_minute || 0
  )

  // ============================================================
  // PACE SCORE
  // ============================================================

  let paceScore = 0

  if (wpm > 0) {
    if (wpm >= 120 && wpm <= 180) {
      paceScore = 100
    } else if (wpm >= 100 && wpm <= 200) {
      paceScore = 80
    } else {
      paceScore = 60
    }
  }

  // ============================================================
  // OVERALL SCORE
  // ============================================================

  const visualScore =
    (faceScore +
      eyeScore +
      forwardScore +
      engagementScore) /
    4

  const overallScore =
    wpm > 0
      ? Math.round(
          (visualScore + paceScore) / 2
        )
      : Math.round(visualScore)

  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const formatNumber = (
    value,
    decimals = 1
  ) => {
    const number = Number(value)

    if (Number.isNaN(number)) {
      return "—"
    }

    return number.toFixed(decimals)
  }

  // ============================================================
  // VISUAL FEEDBACK
  // ============================================================

  const getEngagementFeedback = () => {
    if (engagement >= 80) {
      return "Excellent engagement. You maintained a strong visual presence throughout the interview."
    }

    if (engagement >= 60) {
      return "Good engagement. There is room to make your visual presence stronger."
    }

    return "Your visual engagement could be improved. Try maintaining more consistent eye contact."
  }

  // ============================================================
  // SPEECH FEEDBACK
  // ============================================================

  const getSpeechFeedback = () => {
    const fillers = Number(
      speech.total_fillers || 0
    )

    const pauses = Number(
      speech.pause_count || 0
    )

    if (wpm === 0) {
      return "Speech information could not be measured."
    }

    const feedback = []

    // Speaking pace
    if (wpm < 120) {
      feedback.push(
        "Your speaking pace is slightly slow. Try maintaining a more natural interview rhythm."
      )
    } else if (wpm <= 180) {
      feedback.push(
        "Your speaking pace is within a comfortable interview range."
      )
    } else {
      feedback.push(
        "Your speaking pace is quite fast. Try slowing down slightly for clearer communication."
      )
    }

    // Filler words
    if (fillers === 0) {
      feedback.push(
        "You avoided unnecessary filler words, which supports clear communication."
      )
    } else if (fillers <= 5) {
      feedback.push(
        "Your filler-word usage is low. Continue maintaining concise and confident speech."
      )
    } else {
      feedback.push(
        "Try reducing filler words such as 'um', 'uh', or 'like' to make your responses more confident."
      )
    }

    // Pauses
    if (pauses === 0) {
      feedback.push(
        "Your speech contained no significant pauses."
      )
    } else if (pauses <= 3) {
      feedback.push(
        "Your pauses were limited and should not significantly affect your delivery."
      )
    } else {
      feedback.push(
        "Consider practicing smoother transitions between ideas to reduce frequent pauses."
      )
    }

    return feedback.join(" ")
  }

  // ============================================================
  // OVERALL FEEDBACK
  // ============================================================

  const getOverallFeedback = () => {
    const feedback = []

    if (visualScore >= 80) {
      feedback.push(
        "You demonstrated strong visual presence and maintained good engagement."
      )
    } else {
      feedback.push(
        "Work on maintaining consistent eye contact and a stronger visual presence."
      )
    }

    if (
      wpm >= 120 &&
      wpm <= 180
    ) {
      feedback.push(
        "Your speaking pace was well suited for an interview."
      )
    } else if (wpm > 180) {
      feedback.push(
        "Try slowing your speaking pace slightly to improve clarity."
      )
    } else if (wpm > 0) {
      feedback.push(
        "Try speaking slightly faster to maintain a more natural conversational flow."
      )
    }

    const fillers = Number(
      speech.total_fillers || 0
    )

    if (fillers > 5) {
      feedback.push(
        "Reducing filler words will make your responses sound more confident and polished."
      )
    }

    return feedback.join(" ")
  }

  // ============================================================
  // METRIC CARD
  // ============================================================

  const MetricCard = ({
    title,
    value,
    description,
    status = "good",
  }) => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        viewport={{
          once: true,
        }}
        className="bg-[#292236] border border-[#403650] rounded-2xl p-5"
      >
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
      </motion.div>
    )
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen bg-[#15111d] text-white">

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <header className="h-[72px] border-b border-[#30283b] bg-[#1c1725]">

        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-xl bg-[#292236] border border-[#403650] flex items-center justify-center text-[#c6a4ff] text-xl">
              ✦
            </div>

            <h1 className="text-xl font-semibold">
              SkillMirror
            </h1>

          </button>

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/history")}
              className="text-sm text-[#b9adca] hover:text-white transition"
            >
              Interview History
            </button>

            <span className="text-sm text-[#b9adca] hidden sm:block">
              Interview Results
            </span>

          </div>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* ====================================================
            HEADER
        ===================================================== */}

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

        {/* ====================================================
            OVERALL PERFORMANCE
        ===================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="bg-[#292236] border border-[#403650] rounded-3xl p-8 mb-8"
        >

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>

              <p className="uppercase tracking-[0.2em] text-xs text-[#bda8dc] mb-4">
                Overall Performance
              </p>

              <h2 className="text-3xl font-semibold mb-3">
                Interview Analysis Complete
              </h2>

              <p className="text-[#b7aac9] max-w-xl">
                Your recording was successfully processed across
                video and speech signals.
              </p>

            </div>

            {/* Overall Circle */}

            <div className="flex-shrink-0">

              <div className="w-32 h-32 rounded-full border-4 border-[#b996e8] flex flex-col items-center justify-center">

                <span className="text-4xl font-semibold text-[#d0b7f5]">
                  {overallScore}
                </span>

                <span className="text-xs uppercase tracking-wide text-[#b7aac9]">
                  Overall Score
                </span>

              </div>

            </div>

          </div>

        </motion.section>

        {/* ====================================================
            PERFORMANCE SUMMARY
        ===================================================== */}

        <section className="mb-10">

          <div className="bg-[#211b2c] border border-[#403650] rounded-3xl p-7">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-3">
              Performance Summary
            </p>

            <h2 className="text-2xl font-semibold mb-3">
              Your interview at a glance
            </h2>

            <p className="text-[#b7aac9] leading-relaxed">

              {overallScore >= 80
                ? "You demonstrated strong overall interview performance. Your visual presence and communication were effective, with a few areas that can still be refined."
                : overallScore >= 60
                ? "You showed a solid foundation in your interview performance. Improving consistency in visual presence and speech delivery can make your responses stronger."
                : "Your interview performance has several areas that can be improved. Focus on maintaining visual engagement and delivering your responses at a comfortable pace."}

            </p>

          </div>

        </section>

        {/* ====================================================
            VISUAL PRESENCE
        ===================================================== */}

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
              value={`${formatNumber(
                video.face_detection_percentage,
                0
              )}%`}
              description="Face visible during interview"
            />

            <MetricCard
              title="Eyes Open"
              value={`${formatNumber(
                video.eye_open_percentage
              )}%`}
              description="Estimated eye openness"
            />

            <MetricCard
              title="Forward Looking"
              value={`${formatNumber(
                video.forward_looking_percentage
              )}%`}
              description="Forward-facing attention"
              status={
                Number(
                  video.forward_looking_percentage || 0
                ) < 30
                  ? "warning"
                  : "good"
              }
            />

            <MetricCard
              title="Engagement"
              value={`${formatNumber(
                video.average_engagement
              )}%`}
              description="Overall visual engagement"
            />

          </div>

          {/* Visual Feedback */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            viewport={{
              once: true,
            }}
            className="mt-4 bg-[#211b2c] border border-[#403650] rounded-2xl p-5 flex gap-4"
          >

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

          </motion.div>

        </section>

        {/* ====================================================
            SPEECH
        ===================================================== */}

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
              value={`${Math.round(
                Number(
                  speech.words_per_minute || 0
                )
              )} WPM`}
              description="Words per minute"
              status={
                Number(
                  speech.words_per_minute || 0
                ) < 100 ||
                Number(
                  speech.words_per_minute || 0
                ) > 200
                  ? "warning"
                  : "good"
              }
            />

            <MetricCard
              title="Filler Words"
              value={speech.total_fillers || 0}
              description="Detected fillers"
              status={
                Number(
                  speech.total_fillers || 0
                ) > 5
                  ? "warning"
                  : "good"
              }
            />

            <MetricCard
              title="Pauses"
              value={speech.pause_count || 0}
              description="Detected pauses"
              status={
                Number(
                  speech.pause_count || 0
                ) > 3
                  ? "warning"
                  : "good"
              }
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

          {/* Speech Quality Score */}

          <div className="mt-4 bg-[#211b2c] border border-[#403650] rounded-2xl p-5">

            <div className="flex items-center justify-between mb-3">

              <div>

                <p className="text-sm text-[#9f92ae]">
                  Speech Delivery Score
                </p>

                <p className="text-3xl font-bold text-[#c6a4ff] mt-1">
                  {paceScore}%
                </p>

              </div>

              <div className="text-right">

                <p className="text-xs uppercase tracking-[0.18em] text-[#9f92ae]">
                  Pace Quality
                </p>

                <p className="text-sm text-[#d7c8ed] mt-1">

                  {paceScore >= 80
                    ? "Strong"
                    : paceScore >= 60
                    ? "Needs Improvement"
                    : "Not Measured"}

                </p>

              </div>

            </div>

            <div className="w-full h-2 bg-[#30283b] rounded-full overflow-hidden">

              <div
                className="h-full bg-[#b896e8] rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    paceScore,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </section>

        {/* ====================================================
            VOCAL DELIVERY
        ===================================================== */}

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
              value={`${formatNumber(
                prosody.average_pitch_hz
              )} Hz`}
              description="Average vocal pitch"
            />

            <MetricCard
              title="Pitch Variation"
              value={`${formatNumber(
                prosody.pitch_variation_hz
              )} Hz`}
              description="Vocal variation"
            />

            <MetricCard
              title="Average Energy"
              value={formatNumber(
                prosody.average_energy,
                3
              )}
              description="Voice energy"
            />

            <MetricCard
              title="Energy Variation"
              value={formatNumber(
                prosody.energy_variation,
                3
              )}
              description="Delivery variation"
            />

          </div>

        </section>

        {/* ====================================================
            PERFORMANCE BREAKDOWN
        ===================================================== */}

        <section className="mt-16">

          <div className="mb-8">

            <p className="text-sm tracking-[0.25em] text-[#b896e8]">
              04 · PERFORMANCE
            </p>

            <h2 className="text-3xl font-semibold mt-2">
              Performance breakdown
            </h2>

            <p className="text-[#b9acd0] mt-2">
              A quick overview of your interview performance.
            </p>

          </div>

          <div className="bg-[#211b2c] border border-[#3a3145] rounded-2xl p-8 space-y-7">

            {/* Visual Presence */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="text-[#d7c8ed]">
                  Visual Presence
                </span>

                <span className="text-white font-medium">
                  {Math.round(
                    visualScore
                  )}%
                </span>

              </div>

              <div className="w-full h-3 bg-[#30283b] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#b896e8] rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      visualScore,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Speaking Pace */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="text-[#d7c8ed]">
                  Speaking Pace
                </span>

                <span className="text-white font-medium">
                  {paceScore}%
                </span>

              </div>

              <div className="w-full h-3 bg-[#30283b] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#b896e8] rounded-full transition-all duration-700"
                  style={{
                    width: `${paceScore}%`,
                  }}
                />

              </div>

            </div>

            {/* Overall */}

            <div>

              <div className="flex justify-between mb-2">

                <span className="text-[#d7c8ed]">
                  Overall Performance
                </span>

                <span className="text-white font-medium">
                  {overallScore}%
                </span>

              </div>

              <div className="w-full h-3 bg-[#30283b] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#b896e8] rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      overallScore,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            AI FEEDBACK
        ===================================================== */}

        <section className="mt-16">

          <div className="mb-8">

            <p className="text-sm tracking-[0.25em] text-[#b896e8]">
              05 · AI FEEDBACK
            </p>

            <h2 className="text-3xl font-semibold mt-2">
              Personalized feedback
            </h2>

            <p className="text-[#b9acd0] mt-2">
              Practical insights based on your interview performance.
            </p>

          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
            }}
            className="bg-[#211b2c] border border-[#3a3145] rounded-2xl p-6 md:p-8"
          >

            <div className="flex items-start gap-5">

              <div className="w-12 h-12 rounded-xl bg-[#302544] flex items-center justify-center text-2xl shrink-0">
                ✦
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  Your interview insights
                </h3>

                <p className="text-[#b9acd0] mt-3 leading-7">
                  {getOverallFeedback()}
                </p>

              </div>

            </div>

          </motion.div>

        </section>

        {/* ====================================================
            TRANSCRIPT
        ===================================================== */}

        <section className="mt-16 mb-10">

          <div className="mb-5">

            <p className="uppercase tracking-[0.22em] text-xs text-[#bd96ee] mb-2">
              06 · Transcript
            </p>

            <h2 className="text-2xl font-semibold">
              What you said
            </h2>

          </div>

          <div className="bg-[#292236] border border-[#403650] rounded-3xl p-7">

            <p className="text-[#d1c7dc] leading-relaxed text-lg">

              {speech.transcript ||
                "No transcript available."}

            </p>

          </div>

        </section>

        {/* ====================================================
            ADDITIONAL SPEECH DETAILS
        ===================================================== */}

        <section className="mb-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <MetricCard
              title="Audio Duration"
              value={`${formatNumber(
                speech.audio_duration
              )}s`}
              description="Total recorded audio"
            />

            <MetricCard
              title="Speaking Duration"
              value={`${formatNumber(
                speech.speaking_duration
              )}s`}
              description="Time spent speaking"
            />

            <MetricCard
              title="Longest Pause"
              value={`${formatNumber(
                speech.longest_pause
              )}s`}
              description="Longest detected pause"
            />

          </div>

        </section>

        {/* ====================================================
            BUTTONS
        ===================================================== */}

        <div className="border-t border-[#3a3145] pt-8 flex flex-col sm:flex-row gap-4">

          <button
            onClick={() => {
              sessionStorage.removeItem(
                "interviewResults"
              )

              navigate("/setup")
            }}
            className="px-7 py-4 rounded-xl bg-[#b896e8] text-[#1a1422] font-medium hover:bg-[#c8aaf0] transition"
          >
            Practice Again →
          </button>

          <button
            onClick={() => navigate("/history")}
            className="px-7 py-4 rounded-xl bg-[#30283b] text-white font-medium hover:bg-[#3b3148] transition border border-[#403650]"
          >
            Interview History
          </button>

          <button
            onClick={() => navigate("/")}
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