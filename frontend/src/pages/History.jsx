import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function History() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ---------------------------------------------------------
  // GET LOGGED-IN USER
  // ---------------------------------------------------------

  const user = JSON.parse(
  sessionStorage.getItem("skillmirrorUser") || "null"
);

const userId = user?.user_id;

  // ---------------------------------------------------------
  // FETCH INTERVIEW HISTORY
  // ---------------------------------------------------------

  useEffect(() => {
    // User is not logged in
    if (!user || !user.user_id) {
      setError("Please login to view your interview history.");
      setLoading(false);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/interview-history/${userId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch interview history"
          );
        }

        return response.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setInterviews(data.interviews || []);
        } else {
          setError(
            data.message ||
              "Unable to load interview history"
          );
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.user_id]);

  // ---------------------------------------------------------
  // FORMAT DATE
  // ---------------------------------------------------------

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Unknown date";
    }

    return new Date(dateString).toLocaleString();
  };

  // ---------------------------------------------------------
  // NOT LOGGED IN / ERROR
  // ---------------------------------------------------------

  if (!user || !user.user_id) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <h1 style={styles.title}>
            Interview History
          </h1>

          <p style={styles.message}>
            Please login to view your interview history.
          </p>

          <button
            style={styles.button}
            onClick={() => navigate("/login")}
          >
            Login →
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <h1 style={styles.title}>
            Interview History
          </h1>

          <p style={styles.message}>
            Loading your interviews...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <h1 style={styles.title}>
            Interview History
          </h1>

          <p style={styles.error}>
            {error}
          </p>

          <button
            style={styles.button}
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ------------------------------------------------ */}
        {/* HEADER */}
        {/* ------------------------------------------------ */}

        <div style={styles.header}>

          <div>
            <button
              onClick={() => navigate("/")}
              style={styles.backButton}
            >
              ← Dashboard
            </button>

            <p style={styles.label}>
              YOUR PROGRESS
            </p>

            <h1 style={styles.title}>
              Interview History
            </h1>

            <p style={styles.subtitle}>
              Review your previous interview performances
              and track your improvement over time.
            </p>
          </div>

          <div style={styles.countBox}>
            <span style={styles.count}>
              {interviews.length}
            </span>

            <span style={styles.countLabel}>
              INTERVIEWS
            </span>
          </div>

        </div>

        {/* ------------------------------------------------ */}
        {/* EMPTY STATE */}
        {/* ------------------------------------------------ */}

        {interviews.length === 0 ? (
          <div style={styles.empty}>

            <div style={styles.emptyIcon}>
              ✦
            </div>

            <h2 style={styles.emptyTitle}>
              No interviews yet
            </h2>

            <p style={styles.emptyText}>
              Complete your first mock interview and
              your results will appear here.
            </p>

            <button
              style={styles.button}
              onClick={() => navigate("/setup")}
            >
              Start Your First Interview →
            </button>

          </div>
        ) : (

          /* ------------------------------------------------ */
          /* INTERVIEW LIST */
          /* ------------------------------------------------ */

          <div style={styles.list}>

            {interviews.map((interview) => (

              <div
                key={interview.id}
                style={styles.card}
              >

                {/* CARD HEADER */}

                <div style={styles.cardHeader}>

                  <div>

                    <p style={styles.interviewNumber}>
                      INTERVIEW #{interview.id}
                    </p>

                    <h2 style={styles.date}>
                      {formatDate(
                        interview.created_at
                      )}
                    </h2>

                  </div>

                  <div style={styles.engagement}>

                    <span
                      style={styles.engagementValue}
                    >
                      {Number(
                        interview.engagement_score || 0
                      ).toFixed(1)}
                    </span>

                    <span
                      style={styles.engagementLabel}
                    >
                      ENGAGEMENT
                    </span>

                  </div>

                </div>

                {/* METRICS */}

                <div style={styles.metrics}>

                  <Metric
                    label="Words"
                    value={
                      interview.word_count ?? 0
                    }
                  />

                  <Metric
                    label="Speaking Pace"
                    value={`${Number(
                      interview.words_per_minute || 0
                    ).toFixed(0)} WPM`}
                  />

                  <Metric
                    label="Filler Words"
                    value={
                      interview.total_fillers ?? 0
                    }
                  />

                  <Metric
                    label="Pauses"
                    value={
                      interview.pause_count ?? 0
                    }
                  />

                </div>

                {/* TRANSCRIPT */}

                {interview.transcript && (
                  <div style={styles.transcriptBox}>

                    <span style={styles.transcriptLabel}>
                      TRANSCRIPT
                    </span>

                    <p style={styles.transcript}>
                      {interview.transcript}
                    </p>

                  </div>
                )}

                {/* FOOTER */}

                <div style={styles.footer}>

                  <span>
                    Duration:{" "}
                    {Number(
                      interview.audio_duration || 0
                    ).toFixed(1)}
                    s
                  </span>

                  <button
                    style={styles.button}
                    onClick={() => {
  sessionStorage.setItem(
    "selectedInterview",
    JSON.stringify(interview)
  );

  navigate("/results");
}}
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
  );
}

// ============================================================
// METRIC COMPONENT
// ============================================================

function Metric({ label, value }) {
  return (
    <div style={styles.metric}>

      <span style={styles.metricLabel}>
        {label}
      </span>

      <strong style={styles.metricValue}>
        {value}
      </strong>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#110d19",
    color: "#ffffff",
    padding: "60px 24px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  centerBox: {
    maxWidth: "600px",
    margin: "120px auto",
    textAlign: "center",
    background: "#211a2d",
    border: "1px solid #3d324d",
    borderRadius: "20px",
    padding: "60px 30px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "45px",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#b78cff",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0",
    marginBottom: "25px",
  },

  label: {
    color: "#b78cff",
    letterSpacing: "4px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  title: {
    fontSize: "48px",
    margin: 0,
    fontWeight: "600",
  },

  subtitle: {
    color: "#b8adc9",
    fontSize: "17px",
    lineHeight: "1.6",
    maxWidth: "650px",
    marginTop: "15px",
  },

  countBox: {
    background: "#282038",
    border: "1px solid #403354",
    borderRadius: "18px",
    padding: "20px 28px",
    minWidth: "120px",
    textAlign: "center",
  },

  count: {
    display: "block",
    fontSize: "32px",
    fontWeight: "600",
  },

  countLabel: {
    display: "block",
    color: "#a99aba",
    fontSize: "11px",
    letterSpacing: "2px",
    marginTop: "4px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  card: {
    background: "#211a2d",
    border: "1px solid #3d324d",
    borderRadius: "20px",
    padding: "28px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  interviewNumber: {
    color: "#b78cff",
    letterSpacing: "2px",
    fontSize: "12px",
    margin: 0,
  },

  date: {
    fontSize: "21px",
    fontWeight: "500",
    margin: "8px 0 0",
  },

  engagement: {
    border: "2px solid #b78cff",
    borderRadius: "50%",
    width: "82px",
    height: "82px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  engagementValue: {
    fontSize: "21px",
    fontWeight: "600",
  },

  engagementLabel: {
    fontSize: "8px",
    color: "#b8adc9",
    marginTop: "3px",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "25px",
  },

  metric: {
    background: "#2a2238",
    borderRadius: "12px",
    padding: "17px",
  },

  metricLabel: {
    display: "block",
    color: "#a99aba",
    fontSize: "12px",
    marginBottom: "7px",
  },

  metricValue: {
    fontSize: "20px",
  },

  transcriptBox: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "12px",
    background: "#2a2238",
    border: "1px solid #3d324d",
  },

  transcriptLabel: {
    display: "block",
    color: "#b78cff",
    fontSize: "11px",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  transcript: {
    color: "#b8adc9",
    lineHeight: "1.6",
    margin: 0,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #3d324d",
    color: "#a99aba",
    fontSize: "13px",
  },

  button: {
    background: "#b78cff",
    color: "#17121f",
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    fontWeight: "600",
    cursor: "pointer",
  },

  empty: {
    background: "#211a2d",
    border: "1px solid #3d324d",
    borderRadius: "20px",
    padding: "60px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "42px",
    color: "#b78cff",
    marginBottom: "20px",
  },

  emptyTitle: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  emptyText: {
    color: "#b8adc9",
    marginBottom: "25px",
    lineHeight: "1.6",
  },

  message: {
    color: "#b8adc9",
    marginBottom: "25px",
  },

  error: {
    color: "#ff8c8c",
    marginBottom: "25px",
  },
};

export default History;