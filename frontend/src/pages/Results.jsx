import { useEffect, useState } from "react"

function Results() {
  const [results, setResults] = useState(null)

  useEffect(() => {
    const storedResults = sessionStorage.getItem("interviewResults")

    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }
  }, [])

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-3xl font-bold">
          No interview results found.
        </h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Interview Results
        </h1>

        <p className="text-slate-400 mb-8">
          Here's your AI-powered interview analysis.
        </p>

        {/* Overall status */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
          <h2 className="text-xl font-semibold mb-3">
            Analysis Status
          </h2>

          <p className="text-green-400">
            {results.status || "Completed"}
          </p>
        </div>

        {/* Video Analysis */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
          <h2 className="text-2xl font-semibold mb-4">
            Video & Engagement Analysis
          </h2>

          <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto">
            {JSON.stringify(results.video_analysis, null, 2)}
          </pre>
        </div>

        {/* Speech Analysis */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-2xl font-semibold mb-4">
            Speech Analysis
          </h2>

          <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-auto">
            {JSON.stringify(results.speech_analysis, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  )
}

export default Results