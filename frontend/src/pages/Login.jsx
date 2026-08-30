import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const from = location.state?.from || "/"

  const handleLogin = async (event) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.status !== "success") {
        setError(data.message || "Login failed.")
        return
      }

      sessionStorage.setItem(
        "skillmirrorUser",
        JSON.stringify({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
        })
      )

      navigate(from, { replace: true })
    } catch (error) {
      console.error("Login error:", error)

      setError(
        "Unable to connect to the server. Make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#15111d] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            SkillMirror AI
          </h1>

          <p className="text-gray-400 mt-2">
            Sign in to continue your interview practice
          </p>
        </div>

        <div className="bg-[#211b2d] border border-[#3a314b] rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
            Welcome back
          </h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg bg-[#17121f] border border-[#3a314b] px-4 py-3 text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg bg-[#17121f] border border-[#3a314b] px-4 py-3 text-white outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 py-3 font-semibold transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-purple-300 hover:text-purple-200 font-medium"
            >
              Create one
            </button>
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>
    </div>
  )
}

export default Login