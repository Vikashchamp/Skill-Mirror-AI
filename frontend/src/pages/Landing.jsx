import { useNavigate } from "react-router-dom"

function Landing() {
  const navigate = useNavigate()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17131F]">

      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          -top-40
          left-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          rounded-full
          bg-[#B99AE8]/10
          blur-[120px]
          animate-soft-glow
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          top-[35%]
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#C98FA8]/8
          blur-[120px]
        "
      />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-[#3A3046]
              bg-[#282033]
              text-[#D5C2F4]
              shadow-[0_0_25px_rgba(185,154,232,0.12)]
            "
          >
            ✦
          </div>

          <span className="font-['Manrope'] text-lg font-bold tracking-tight">
            SkillMirror
          </span>

        </div>

        <div className="hidden items-center gap-8 text-sm text-[#B9B0C2] md:flex">
          <a href="#how-it-works" className="transition hover:text-[#F5F1F8]">
            How it works
          </a>

          <a href="#features" className="transition hover:text-[#F5F1F8]">
            Features
          </a>
        </div>

      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-6 pb-20 pt-10 lg:px-10">

        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Left */}
          <div className="animate-fade-up">

            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#3A3046]
                bg-[#211A2B]/80
                px-4
                py-2
                text-sm
                text-[#B9B0C2]
                backdrop-blur-md
              "
            >
              <span className="h-2 w-2 rounded-full bg-[#91B7A1] shadow-[0_0_10px_rgba(145,183,161,0.6)]" />
              AI-powered interview practice
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-[#F5F1F8] sm:text-6xl lg:text-7xl">

              Practice smarter.

              <span className="mt-2 block gradient-text">
                Interview better.
              </span>

            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#B9B0C2] sm:text-xl">
              SkillMirror analyzes your interview performance through
              speech, video, and engagement signals — then shows you
              exactly where you can improve.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <button
                onClick={() => navigate("/setup")}
                className="primary-button px-7 py-3.5"
              >
                Start Interview
                <span className="ml-2">→</span>
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="secondary-button px-7 py-3.5"
              >
                See how it works
              </button>

            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#B9B0C2]">

              <div className="flex items-center gap-2">
                <span className="text-[#91B7A1]">✓</span>
                Real-time analysis
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#91B7A1]">✓</span>
                Speech insights
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#91B7A1]">✓</span>
                Interview feedback
              </div>

            </div>

          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block animate-scale-in">

            {/* Outer glow */}
            <div
              className="
                absolute
                inset-10
                rounded-[32px]
                bg-[#B99AE8]/10
                blur-[60px]
              "
            />

            {/* Interview preview */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-[#3A3046]
                bg-[#211A2B]
                p-4
                shadow-[0_30px_80px_rgba(0,0,0,0.35)]
                animate-float
              "
            >

              {/* Window top */}
              <div className="mb-4 flex items-center justify-between">

                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C98FA8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D9A38F]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#91B7A1]" />
                </div>

                <span className="text-xs text-[#B9B0C2]">
                  SkillMirror AI
                </span>

                <span className="text-xs text-[#91B7A1]">
                  ● Live
                </span>

              </div>

              {/* Camera */}
              <div
                className="
                  relative
                  aspect-video
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#3A3046]
                  bg-[#282033]
                "
              >

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-[#30273D]
                    via-[#282033]
                    to-[#211A2B]
                  "
                />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div
                    className="
                      flex
                      h-28
                      w-28
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#B99AE8]/30
                      bg-[#30273D]
                      text-4xl
                      text-[#D5C2F4]
                      shadow-[0_0_40px_rgba(185,154,232,0.15)]
                    "
                  >
                    ✦
                  </div>

                </div>

                <div className="absolute bottom-4 left-4 rounded-lg border border-[#3A3046] bg-[#17131F]/80 px-3 py-2 text-xs text-[#B9B0C2] backdrop-blur">
                  Camera active
                </div>

              </div>

              {/* Question */}
              <div className="mt-4 rounded-2xl border border-[#3A3046] bg-[#282033] p-5">

                <p className="text-xs uppercase tracking-widest text-[#B99AE8]">
                  Question 01
                </p>

                <p className="mt-2 font-['Manrope'] text-lg font-semibold leading-7 text-[#F5F1F8]">
                  Tell me about yourself and your experience.
                </p>

              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-3">

                <div className="rounded-xl border border-[#3A3046] bg-[#30273D] p-3">
                  <p className="text-xs text-[#B9B0C2]">Confidence</p>
                  <p className="mt-1 text-lg font-bold text-[#D5C2F4]">
                    86%
                  </p>
                </div>

                <div className="rounded-xl border border-[#3A3046] bg-[#30273D] p-3">
                  <p className="text-xs text-[#B9B0C2]">Clarity</p>
                  <p className="mt-1 text-lg font-bold text-[#91B7A1]">
                    91%
                  </p>
                </div>

                <div className="rounded-xl border border-[#3A3046] bg-[#30273D] p-3">
                  <p className="text-xs text-[#B9B0C2]">Pace</p>
                  <p className="mt-1 text-lg font-bold text-[#C98FA8]">
                    78%
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10"
      >

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B99AE8]">
            How it works
          </p>

          <h2 className="mt-4 text-3xl font-bold text-[#F5F1F8] sm:text-4xl">
            Your interview, reflected back to you.
          </h2>

          <p className="mt-4 leading-7 text-[#B9B0C2]">
            Practice naturally. SkillMirror observes the signals that
            matter and turns them into actionable feedback.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">

          {[
            {
              number: "01",
              title: "Practice",
              text: "Enter an interview environment with your camera and microphone.",
            },
            {
              number: "02",
              title: "Analyze",
              text: "AI evaluates speech, engagement, delivery, and visual cues.",
            },
            {
              number: "03",
              title: "Improve",
              text: "Get meaningful insights that help you perform better next time.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="glass-card rounded-2xl p-7"
            >
              <span className="text-sm font-bold text-[#B99AE8]">
                {item.number}
              </span>

              <h3 className="mt-5 text-xl font-bold text-[#F5F1F8]">
                {item.title}
              </h3>

              <p className="mt-3 leading-7 text-[#B9B0C2]">
                {item.text}
              </p>
            </div>
          ))}

        </div>

      </section>

    </main>
  )
}

export default Landing