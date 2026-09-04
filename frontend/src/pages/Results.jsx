import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function Results() {
  const navigate = useNavigate()
  const { interviewId } = useParams()

  const [interview, setInterview] = useState(null)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAIError] = useState("")

  // =========================================================
  // LOAD SELECTED INTERVIEW
  // =========================================================

  useEffect(() => {
    const storedInterview =
      sessionStorage.getItem("selectedInterview")

    if (storedInterview) {
      try {
        setInterview(JSON.parse(storedInterview))
      } catch (error) {
        console.error(
          "Could not read selected interview:",
          error
        )
      }
    }
  }, [])

  // =========================================================
  // FETCH REKA AI FEEDBACK
  // =========================================================

  useEffect(() => {
    if (!interviewId) {
      return
    }

    const fetchAIInsights = async () => {
      try {
        setLoadingAI(true)
        setAIError("")

        const response = await fetch(
          `http://127.0.0.1:8000/ai-insights/${interviewId}`
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)

          throw new Error(
            errorData?.detail ||
            "Failed to fetch AI insights"
          )
        }

        const data = await response.json()

        console.log("REKA AI RESPONSE:", data)

        setAiFeedback(data?.ai_feedback || null)
      } catch (error) {
        console.error(
          "AI insights error:",
          error
        )

        setAIError(
          error.message ||
          "Unable to load AI feedback."
        )
      } finally {
        setLoadingAI(false)
      }
    }

    fetchAIInsights()
  }, [interviewId])

  // =========================================================
  // HELPER
  // =========================================================

  const getValue = (value, fallback = "—") => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback
    }

    return value
  }

  const formatArray = (value) => {
    if (!Array.isArray(value)) {
      return []
    }

    return value
  }

  // =========================================================
  // DATA
  // =========================================================

  const strengths =
    formatArray(aiFeedback?.strengths)

  const improvements =
    formatArray(aiFeedback?.improvements)

  const practicePlan =
    formatArray(aiFeedback?.practice_plan)

  const visualFeedback =
    aiFeedback?.visual_feedback || {}

  const speechFeedback =
    aiFeedback?.speech_feedback || {}

  const overallFeedback =
    aiFeedback?.overall_feedback ||
    aiFeedback?.summary ||
    ""

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <div style={styles.topBar}>

          <button
            style={styles.backButton}
            onClick={() => navigate("/history")}
          >
            ← Interview History
          </button>

          <div style={styles.logo}>
            SKILLMIRROR AI
          </div>

        </div>

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div style={styles.header}>

          <p style={styles.eyebrow}>
            INTERVIEW ANALYSIS
          </p>

          <h1 style={styles.title}>
            Your Interview Results
          </h1>

          <p style={styles.subtitle}>
            Review your performance and get
            AI-powered feedback to improve
            your next interview.
          </p>

          {interviewId && (
            <div style={styles.sessionBadge}>
              Interview #{interviewId}
            </div>
          )}

        </div>

        {/* ===================================================
            BASIC INTERVIEW METRICS
        ==================================================== */}

        {interview && (
          <section style={styles.section}>

            <div style={styles.sectionHeader}>
              <p style={styles.sectionNumber}>
                01
              </p>

              <div>
                <h2 style={styles.sectionTitle}>
                  Performance Overview
                </h2>

                <p style={styles.sectionDescription}>
                  Key measurements from your interview.
                </p>
              </div>
            </div>

            <div style={styles.metricsGrid}>

              <MetricCard
                label="Engagement"
                value={
                  interview.engagement_score != null
                    ? `${Number(
                        interview.engagement_score
                      ).toFixed(2)}%`
                    : "—"
                }
              />

              <MetricCard
                label="Speaking Rate"
                value={
                  interview.words_per_minute != null
                    ? `${Number(
                        interview.words_per_minute
                      ).toFixed(0)} WPM`
                    : "—"
                }
              />

              <MetricCard
                label="Fillers"
                value={getValue(
                  interview.total_fillers
                )}
              />

              <MetricCard
                label="Pauses"
                value={getValue(
                  interview.pause_count
                )}
              />

              <MetricCard
                label="Face Detection"
                value={
                  interview.face_detection_percentage != null
                    ? `${Number(
                        interview.face_detection_percentage
                      ).toFixed(1)}%`
                    : "—"
                }
              />

              <MetricCard
                label="Eye Open"
                value={
                  interview.eye_open_percentage != null
                    ? `${Number(
                        interview.eye_open_percentage
                      ).toFixed(1)}%`
                    : "—"
                }
              />

            </div>

          </section>
        )}

        {/* ===================================================
            AI FEEDBACK
        ==================================================== */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <p style={styles.sectionNumber}>
              02
            </p>

            <div>
              <h2 style={styles.sectionTitle}>
                AI Feedback
              </h2>

              <p style={styles.sectionDescription}>
                Personalized feedback generated from
                your interview analysis.
              </p>
            </div>

          </div>

          {/* LOADING */}

          {loadingAI && (
            <div style={styles.loadingCard}>

              <div style={styles.spinner}>
                ✦
              </div>

              <h3 style={styles.loadingTitle}>
                Analysing your interview...
              </h3>

              <p style={styles.loadingText}>
                Reka AI is generating personalized
                feedback based on your performance.
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loadingAI && aiError && (
            <div style={styles.errorCard}>

              <h3 style={styles.errorTitle}>
                Unable to load AI feedback
              </h3>

              <p style={styles.errorText}>
                {aiError}
              </p>

              <button
                style={styles.retryButton}
                onClick={() => {
                  if (interviewId) {
                    window.location.reload()
                  }
                }}
              >
                Try Again
              </button>

            </div>
          )}

          {/* AI RESULT */}

          {!loadingAI &&
            !aiError &&
            aiFeedback && (

              <div style={styles.aiContent}>

                {/* OVERALL */}

                {overallFeedback && (
                  <div style={styles.overallCard}>

                    <p style={styles.cardEyebrow}>
                      OVERALL FEEDBACK
                    </p>

                    <p style={styles.overallText}>
                      {overallFeedback}
                    </p>

                  </div>
                )}

                {/* STRENGTHS */}

                {strengths.length > 0 && (
                  <FeedbackCard
                    title="What You Did Well"
                    items={strengths}
                    type="positive"
                  />
                )}

                {/* IMPROVEMENTS */}

                {improvements.length > 0 && (
                  <FeedbackCard
                    title="What You Can Improve"
                    items={improvements}
                    type="improvement"
                  />
                )}

                {/* VISUAL */}

                {Object.keys(visualFeedback).length > 0 && (
                  <div style={styles.feedbackCard}>

                    <p style={styles.cardEyebrow}>
                      VISUAL PERFORMANCE
                    </p>

                    <h3 style={styles.feedbackTitle}>
                      How you presented yourself
                    </h3>

                    <div style={styles.feedbackList}>

                      {Object.entries(
                        visualFeedback
                      ).map(([key, value]) => (

                        <div
                          key={key}
                          style={styles.feedbackItem}
                        >
                          <div
                            style={
                              styles.itemBullet
                            }
                          >
                            •
                          </div>

                          <div>
                            <strong
                              style={
                                styles.itemLabel
                              }
                            >
                              {formatLabel(key)}
                            </strong>

                            <p
                              style={
                                styles.itemText
                              }
                            >
                              {String(value)}
                            </p>
                          </div>
                        </div>

                      ))}

                    </div>

                  </div>
                )}

                {/* SPEECH */}

                {Object.keys(speechFeedback).length > 0 && (
                  <div style={styles.feedbackCard}>

                    <p style={styles.cardEyebrow}>
                      SPEECH PERFORMANCE
                    </p>

                    <h3 style={styles.feedbackTitle}>
                      How you communicated
                    </h3>

                    <div style={styles.feedbackList}>

                      {Object.entries(
                        speechFeedback
                      ).map(([key, value]) => (

                        <div
                          key={key}
                          style={styles.feedbackItem}
                        >
                          <div
                            style={
                              styles.itemBullet
                            }
                          >
                            •
                          </div>

                          <div>
                            <strong
                              style={
                                styles.itemLabel
                              }
                            >
                              {formatLabel(key)}
                            </strong>

                            <p
                              style={
                                styles.itemText
                              }
                            >
                              {String(value)}
                            </p>
                          </div>
                        </div>

                      ))}

                    </div>

                  </div>
                )}

                {/* PRACTICE PLAN */}

                {practicePlan.length > 0 && (
                  <div style={styles.feedbackCard}>

                    <p style={styles.cardEyebrow}>
                      PRACTICE PLAN
                    </p>

                    <h3 style={styles.feedbackTitle}>
                      Your next steps
                    </h3>

                    <div style={styles.practiceList}>

                      {practicePlan.map(
                        (item, index) => (

                          <div
                            key={index}
                            style={
                              styles.practiceItem
                            }
                          >

                            <div
                              style={
                                styles.practiceNumber
                              }
                            >
                              {index + 1}
                            </div>

                            <p
                              style={
                                styles.practiceText
                              }
                            >
                              {String(item)}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>
                )}

              </div>
            )}

        </section>

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div style={styles.actions}>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/history")}
          >
            View History
          </button>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/setup")}
          >
            Start Another Interview →
          </button>

        </div>

      </div>

    </div>
  )
}

// =============================================================
// METRIC CARD
// =============================================================

function MetricCard({ label, value }) {
  return (
    <div style={styles.metricCard}>

      <span style={styles.metricLabel}>
        {label}
      </span>

      <span style={styles.metricValue}>
        {value}
      </span>

    </div>
  )
}

// =============================================================
// FEEDBACK CARD
// =============================================================

function FeedbackCard({
  title,
  items,
  type,
}) {
  return (
    <div style={styles.feedbackCard}>

      <p style={styles.cardEyebrow}>
        {type === "positive"
          ? "STRENGTHS"
          : "IMPROVEMENTS"}
      </p>

      <h3 style={styles.feedbackTitle}>
        {title}
      </h3>

      <div style={styles.feedbackList}>

        {items.map((item, index) => (

          <div
            key={index}
            style={styles.feedbackItem}
          >

            <div
              style={{
                ...styles.itemBullet,
                background:
                  type === "positive"
                    ? "#18281f"
                    : "#2a2118",
              }}
            >
              {type === "positive"
                ? "✓"
                : "→"}
            </div>

            <p style={styles.itemText}>
              {String(item)}
            </p>

          </div>

        ))}

      </div>

    </div>
  )
}

// =============================================================
// LABEL FORMATTER
// =============================================================

function formatLabel(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

// =============================================================
// STYLES
// =============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #09090b 0%, #111116 55%, #17131b 100%)",
    color: "#ffffff",
    padding: "35px 24px 60px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "50px",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#a1a1aa",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0",
  },

  logo: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: "#bd96ee",
    fontWeight: "600",
  },

  header: {
    marginBottom: "55px",
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: "11px",
    letterSpacing: "0.22em",
    color: "#bd96ee",
    fontWeight: "600",
  },

  title: {
    margin: "0",
    fontSize: "44px",
    lineHeight: "1.1",
    fontWeight: "700",
  },

  subtitle: {
    margin:
      "15px 0 20px",
    maxWidth: "650px",
    color: "#a1a1aa",
    fontSize: "15px",
    lineHeight: "1.65",
  },

  sessionBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    border: "1px solid #27272a",
    background: "#18181b",
    color: "#a1a1aa",
    fontSize: "11px",
  },

  section: {
    marginBottom: "55px",
  },

  sectionHeader: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  sectionNumber: {
    margin: "3px 0 0",
    color: "#bd96ee",
    fontSize: "11px",
    letterSpacing: "0.15em",
    fontWeight: "600",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "25px",
    fontWeight: "600",
  },

  sectionDescription: {
    margin:
      "6px 0 0",
    color: "#71717a",
    fontSize: "13px",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "13px",
  },

  metricCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "14px",
    padding: "19px",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  metricLabel: {
    fontSize: "10px",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  },

  metricValue: {
    fontSize: "22px",
    fontWeight: "600",
  },

  loadingCard: {
    border: "1px solid #27272a",
    background: "#18181b",
    borderRadius: "18px",
    padding: "65px 30px",
    textAlign: "center",
  },

  spinner: {
    fontSize: "28px",
    color: "#bd96ee",
    marginBottom: "18px",
  },

  loadingTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "600",
  },

  loadingText: {
    margin:
      "10px auto 0",
    maxWidth: "500px",
    color: "#71717a",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  errorCard: {
    border: "1px solid #3f2020",
    background: "#181113",
    borderRadius: "18px",
    padding: "35px",
  },

  errorTitle: {
    margin: "0 0 8px",
    fontSize: "19px",
  },

  errorText: {
    margin: "0 0 20px",
    color: "#fca5a5",
    fontSize: "13px",
  },

  retryButton: {
    padding: "10px 17px",
    borderRadius: "9px",
    border: "1px solid #3f3f46",
    background: "#ffffff",
    color: "#09090b",
    cursor: "pointer",
    fontWeight: "600",
  },

  aiContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  overallCard: {
    background:
      "linear-gradient(135deg, #1c1822, #18181b)",
    border: "1px solid #3b3045",
    borderRadius: "18px",
    padding: "28px",
  },

  cardEyebrow: {
    margin: "0 0 10px",
    fontSize: "10px",
    letterSpacing: "0.16em",
    color: "#bd96ee",
    fontWeight: "600",
  },

  overallText: {
    margin: "0",
    color: "#e4e4e7",
    fontSize: "16px",
    lineHeight: "1.7",
  },

  feedbackCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "18px",
    padding: "27px",
  },

  feedbackTitle: {
    margin: "0 0 20px",
    fontSize: "20px",
    fontWeight: "600",
  },

  feedbackList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  feedbackItem: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    padding: "13px 0",
    borderBottom: "1px solid #242428",
  },

  itemBullet: {
    width: "25px",
    height: "25px",
    minWidth: "25px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#202025",
    color: "#d4d4d8",
    fontSize: "12px",
    fontWeight: "600",
  },

  itemLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#d4d4d8",
    fontSize: "13px",
  },

  itemText: {
    margin: "0",
    color: "#a1a1aa",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  practiceList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  practiceItem: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
  },

  practiceNumber: {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    borderRadius: "8px",
    background: "#222026",
    color: "#bd96ee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
  },

  practiceText: {
    margin: "4px 0 0",
    color: "#a1a1aa",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    paddingTop: "10px",
  },

  secondaryButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    background: "#18181b",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
  },

  primaryButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#ffffff",
    color: "#09090b",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
}

export default Results