import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function History() {
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ---------------------------------------------------------
  // GET CURRENT USER
  // ---------------------------------------------------------

  const storedUser = sessionStorage.getItem("skillmirrorUser")

  let userId = 1

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)

      if (user?.user_id) {
        userId = user.user_id
      }
    } catch (error) {
      console.error("Could not read stored user:", error)
    }
  }

  // ---------------------------------------------------------
  // FETCH INTERVIEW HISTORY
  // ---------------------------------------------------------

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `http://127.0.0.1:8000/interview-history/${userId}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch interview history")
        }

        const data = await response.json()

        setHistory(
          Array.isArray(data)
            ? data
            : data.interviews || data.history || []
        )
      } catch (err) {
        console.error("History fetch error:", err)
        setError("Unable to load interview history.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId])

  // ---------------------------------------------------------
  // VIEW RESULTS
  // ---------------------------------------------------------

  const handleViewResults = (interview) => {
    if (!interview?.id) {
      console.error("Interview ID is missing:", interview)
      return
    }

    // Keep the selected interview available to Results page
    sessionStorage.setItem(
      "selectedInterview",
      JSON.stringify(interview)
    )

    // Navigate with interview ID
    navigate(`/results/${interview.id}`)
  }

  // ---------------------------------------------------------
  // FORMAT DATE
  // ---------------------------------------------------------

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable"
    }

    try {
      return new Date(dateValue).toLocaleString()
    } catch {
      return dateValue
    }
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/")}
          >
            ← Back to Dashboard
          </button>

          <div style={styles.centerMessage}>
            Loading interview history...
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/")}
          >
            ← Back to Dashboard
          </button>

          <div style={styles.errorMessage}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>

          <div>
            <p style={styles.eyebrow}>
              SKILLMIRROR AI
            </p>

            <h1 style={styles.title}>
              Interview History
            </h1>

            <p style={styles.subtitle}>
              Review your previous interview performances
              and AI-powered feedback.
            </p>
          </div>

          <button
            style={styles.dashboardButton}
            onClick={() => navigate("/")}
          >
            Dashboard
          </button>

        </div>

        {/* EMPTY STATE */}
        {history.length === 0 ? (
          <div style={styles.emptyCard}>

            <div style={styles.emptyIcon}>
              🎤
            </div>

            <h2 style={styles.emptyTitle}>
              No interviews yet
            </h2>

            <p style={styles.emptyText}>
              Complete your first interview to see your
              performance history here.
            </p>

            <button
              style={styles.startButton}
              onClick={() => navigate("/setup")}
            >
              Start Interview
            </button>

          </div>
        ) : (

          /* HISTORY LIST */
          <div style={styles.list}>

            {history.map((interview, index) => (

              <div
                key={
                  interview.id ??
                  `interview-${index}`
                }
                style={styles.card}
              >

                {/* CARD HEADER */}
                <div style={styles.cardHeader}>

                  <div>
                    <p style={styles.interviewNumber}>
                      INTERVIEW #{interview.id ?? index + 1}
                    </p>

                    <h2 style={styles.cardTitle}>
                      Interview Session
                    </h2>

                    <p style={styles.date}>
                      {formatDate(
                        interview.created_at ||
                        interview.timestamp ||
                        interview.date
                      )}
                    </p>
                  </div>

                  <div style={styles.status}>
                    Completed
                  </div>

                </div>

                {/* METRICS */}
                <div style={styles.metrics}>

                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>
                      Engagement
                    </span>

                    <span style={styles.metricValue}>
                      {interview.engagement_score != null
                        ? `${Number(
                            interview.engagement_score
                          ).toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>

                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>
                      Speaking Rate
                    </span>

                    <span style={styles.metricValue}>
                      {interview.words_per_minute != null
                        ? `${Number(
                            interview.words_per_minute
                          ).toFixed(0)} WPM`
                        : "—"}
                    </span>
                  </div>

                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>
                      Fillers
                    </span>

                    <span style={styles.metricValue}>
                      {interview.total_fillers != null
                        ? interview.total_fillers
                        : "—"}
                    </span>
                  </div>

                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>
                      Pauses
                    </span>

                    <span style={styles.metricValue}>
                      {interview.pause_count != null
                        ? interview.pause_count
                        : "—"}
                    </span>
                  </div>

                </div>

                {/* VIEW RESULTS */}
                <div style={styles.cardFooter}>

                  <button
                    style={styles.resultsButton}
                    onClick={() =>
                      handleViewResults(interview)
                    }
                  >
                    View Results →
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  )
}

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #09090b 0%, #111116 55%, #17131b 100%)",
    color: "#ffffff",
    padding: "40px 24px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#a1a1aa",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0",
    marginBottom: "30px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "45px",
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
    fontSize: "42px",
    lineHeight: "1.1",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "14px",
    marginBottom: "0",
    color: "#a1a1aa",
    fontSize: "15px",
    maxWidth: "600px",
    lineHeight: "1.6",
  },

  dashboardButton: {
    padding: "11px 20px",
    borderRadius: "10px",
    border: "1px solid #27272a",
    background: "#18181b",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  card: {
    background:
      "rgba(24, 24, 27, 0.85)",
    border: "1px solid #27272a",
    borderRadius: "18px",
    padding: "25px",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  interviewNumber: {
    margin: "0 0 7px",
    fontSize: "10px",
    letterSpacing: "0.18em",
    color: "#bd96ee",
    fontWeight: "600",
  },

  cardTitle: {
    margin: "0",
    fontSize: "21px",
    fontWeight: "600",
  },

  date: {
    margin: "7px 0 0",
    color: "#71717a",
    fontSize: "13px",
  },

  status: {
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#18181b",
    border: "1px solid #27272a",
    color: "#a1a1aa",
    fontSize: "11px",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginTop: "25px",
  },

  metric: {
    background: "#111113",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  metricLabel: {
    fontSize: "11px",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  metricValue: {
    fontSize: "19px",
    fontWeight: "600",
    color: "#ffffff",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid #27272a",
  },

  resultsButton: {
    padding: "11px 18px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    background: "#ffffff",
    color: "#09090b",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  emptyCard: {
    textAlign: "center",
    padding: "80px 30px",
    borderRadius: "18px",
    border: "1px solid #27272a",
    background: "rgba(24, 24, 27, 0.8)",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "20px",
  },

  emptyTitle: {
    margin: "0",
    fontSize: "25px",
  },

  emptyText: {
    maxWidth: "480px",
    margin:
      "12px auto 25px",
    color: "#a1a1aa",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  startButton: {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#ffffff",
    color: "#09090b",
    cursor: "pointer",
    fontWeight: "600",
  },

  centerMessage: {
    textAlign: "center",
    padding: "100px 20px",
    color: "#a1a1aa",
  },

  errorMessage: {
    textAlign: "center",
    padding: "40px",
    borderRadius: "14px",
    border: "1px solid #3f2020",
    background: "#181113",
    color: "#fca5a5",
  },
}

export default History