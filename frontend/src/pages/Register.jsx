import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRegister = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.status !== "success") {
        setError(data.message || "Registration failed.")
        return
      }

      setSuccess("Account created successfully!")

      setTimeout(() => {
        navigate("/")
      }, 800)

    } catch (error) {
      console.error("Registration error:", error)

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
            Create your account and start practicing
          </p>
        </div>

        <div className="bg-[#211b2d] border border-[#3a314b] rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
            Create account
          </h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-lg bg-[#17121f] border border-[#3a314b] px-4 py-3 text-white outline-none focus:border-purple-400"
              />
            </div>

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
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-lg bg-[#17121f] border border-[#3a314b] px-4 py-3 text-white outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 py-3 font-semibold transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-300 hover:text-purple-200 font-medium"
            >
              Sign in
            </button>
          </p>

        </div>

      </div>
    </div>
  )
}

export default Register