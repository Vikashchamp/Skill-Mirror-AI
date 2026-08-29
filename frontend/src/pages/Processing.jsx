import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Processing() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results")
    }, 1500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mb-6 text-5xl animate-pulse">
          ✦
        </div>

        <h1 className="text-4xl font-bold mb-3">
          Analyzing Interview...
        </h1>

        <p className="text-slate-400">
          Processing your speech, video and engagement signals.
        </p>
      </div>
    </div>
  )
}

export default Processing