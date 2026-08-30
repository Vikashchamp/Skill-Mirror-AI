import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    const storedUser = sessionStorage.getItem("skillmirrorUser");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Unable to read stored user:", error);
        sessionStorage.removeItem("skillmirrorUser");
      }
    }
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    sessionStorage.removeItem("skillmirrorUser");
    setUser(null);
    navigate("/");
  };

  // ============================================================
  // START INTERVIEW
  // ============================================================

  const handleStartInterview = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/setup");
  };

  // ============================================================
  // SCROLL TO SECTION
  // ============================================================

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#110D19] text-white overflow-x-hidden">

      {/* ========================================================
          FLOATING ANIMATION
      ========================================================= */}

      <style>{`
        @keyframes skillMirrorFloat {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .skillmirror-floating {
          animation: skillMirrorFloat 4s ease-in-out infinite;
        }
      `}</style>

      {/* ========================================================
          NAVBAR
      ========================================================= */}

      <header className="relative z-50 border-b border-[#2C2437] bg-[#110D19]/95 backdrop-blur-md">

        <div className="mx-auto flex h-[74px] max-w-[1370px] items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-[#3A3048]
                bg-[#211A2B]
                text-xl
                text-[#B99AE8]
                shadow-[0_0_30px_rgba(185,154,232,0.08)]
              "
            >
              ✦
            </div>

            <span className="text-xl font-semibold tracking-tight">
              SkillMirror
            </span>

          </button>

          {/* Right Navigation */}

          <div className="flex items-center gap-3">

            {/* Desktop navigation */}

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="
                hidden
                px-4
                py-2
                text-sm
                font-medium
                text-[#B9B0C2]
                transition
                hover:text-white
                sm:block
              "
            >
              How it works
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="
                hidden
                px-4
                py-2
                text-sm
                font-medium
                text-[#B9B0C2]
                transition
                hover:text-white
                sm:block
              "
            >
              Features
            </button>

            {/* ==================================================
                AUTHENTICATION / USER NAVIGATION
            ================================================== */}

            {user ? (
              <>
                <span className="hidden text-sm text-[#B9B0C2] lg:block">
                  Hi, {user.name}
                </span>

                <button
                  onClick={() => navigate("/history")}
                  className="
                    rounded-xl
                    border
                    border-[#3A3046]
                    bg-[#211A2B]
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-[#F5F1F8]
                    transition
                    hover:bg-[#30273D]
                  "
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="
                    rounded-xl
                    border
                    border-[#3A3046]
                    bg-[#211A2B]
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-[#F5F1F8]
                    transition
                    hover:bg-[#30273D]
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="
                    rounded-xl
                    border
                    border-[#3A3046]
                    bg-[#211A2B]
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-[#F5F1F8]
                    transition
                    hover:bg-[#30273D]
                  "
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="
                    rounded-xl
                    bg-[#B99AE8]
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-[#17131F]
                    transition
                    hover:bg-[#C8ADEF]
                  "
                >
                  Register
                </button>
              </>
            )}

          </div>

        </div>

      </header>


      {/* ========================================================
          HERO SECTION
      ======================================================== */}

      <main>

        <section className="relative min-h-[calc(100vh-74px)] overflow-hidden">

          {/* Background glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-[20%]
              top-[-180px]
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#8F5CC7]/10
              blur-[140px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-[5%]
              top-[20%]
              h-[450px]
              w-[450px]
              rounded-full
              bg-[#A86ED8]/8
              blur-[150px]
            "
          />

          <div
            className="
              relative
              mx-auto
              grid
              max-w-[1370px]
              items-center
              gap-14
              px-6
              py-16
              lg:min-h-[calc(100vh-74px)]
              lg:grid-cols-[0.95fr_1.05fr]
              lg:gap-10
              lg:px-10
              lg:py-10
            "
          >

            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="relative z-10">

              {/* Badge */}

              <div
                className="
                  mb-8
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#3A3048]
                  bg-[#1B1624]
                  px-4
                  py-2
                  text-sm
                  text-[#B9B0C2]
                "
              >

                <span className="h-2 w-2 rounded-full bg-[#8FD0B0]" />

                AI-powered interview practice

              </div>


              {/* Heading */}

              <h1
                className="
                  max-w-[700px]
                  text-5xl
                  font-semibold
                  leading-[1.04]
                  tracking-[-0.04em]
                  sm:text-6xl
                  lg:text-[76px]
                "
              >
                Practice smarter.
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-[#B99AE8]
                    via-[#B28BE8]
                    to-[#C89AD9]
                    bg-clip-text
                    text-transparent
                  "
                >
                  Interview better.
                </span>
              </h1>


              {/* Description */}

              <p
                className="
                  mt-7
                  max-w-[650px]
                  text-lg
                  leading-8
                  text-[#B9B0C2]
                  sm:text-xl
                "
              >
                SkillMirror analyzes your interview performance through
                speech, video, and engagement signals — then shows you
                exactly where you can improve.
              </p>


              {/* Buttons */}

              <div className="mt-9 flex flex-wrap gap-4">

                <button
                  onClick={handleStartInterview}
                  className="
                    rounded-xl
                    bg-[#B99AE8]
                    px-7
                    py-4
                    text-base
                    font-semibold
                    text-[#17131F]
                    shadow-[0_10px_40px_rgba(185,154,232,0.15)]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#C8ADEF]
                  "
                >
                  Start Interview →
                </button>

                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="
                    rounded-xl
                    border
                    border-[#3A3048]
                    bg-[#211A2B]
                    px-7
                    py-4
                    text-base
                    font-medium
                    text-[#F5F1F8]
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#2C2437]
                  "
                >
                  See how it works
                </button>

              </div>


              {/* Feature points */}

              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  gap-x-7
                  gap-y-3
                  text-sm
                  text-[#AFA3BA]
                "
              >

                <span className="flex items-center gap-2">
                  <span className="text-[#8FD0B0]">✓</span>
                  Real-time analysis
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#8FD0B0]">✓</span>
                  Speech insights
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#8FD0B0]">✓</span>
                  Interview feedback
                </span>

              </div>

            </div>


            {/* ==================================================
                RIGHT SIDE — FLOATING PREVIEW
            ================================================== */}

            <div className="relative flex justify-center lg:justify-end">

              <div
                className="
                  skillmirror-floating
                  w-full
                  max-w-[540px]
                "
              >

                {/* Main Preview Window */}

                <div
                  className="
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-[#3B3049]
                    bg-[#1B1625]
                    shadow-[0_30px_100px_rgba(0,0,0,0.35)]
                  "
                >

                  {/* Window Header */}

                  <div
                    className="
                      flex
                      h-[70px]
                      items-center
                      justify-between
                      border-b
                      border-[#352B42]
                      px-6
                    "
                  >

                    <div className="flex items-center gap-2">

                      <span className="h-3.5 w-3.5 rounded-full bg-[#D58AAE]" />

                      <span className="h-3.5 w-3.5 rounded-full bg-[#D6A68F]" />

                      <span className="h-3.5 w-3.5 rounded-full bg-[#8BCBAE]" />

                    </div>


                    <span className="text-sm font-medium text-[#8F849C]">
                      SkillMirror AI
                    </span>


                    <div className="flex items-center gap-2 text-sm text-[#8FD0B0]">

                      <span className="h-2 w-2 rounded-full bg-[#8FD0B0]" />

                      Live

                    </div>

                  </div>


                  {/* Camera Area */}

                  <div className="p-6">

                    <div
                      className="
                        relative
                        flex
                        h-[330px]
                        items-center
                        justify-center
                        rounded-[20px]
                        border
                        border-[#3A3048]
                        bg-[#282136]
                      "
                    >

                      {/* Center circle */}

                      <div
                        className="
                          flex
                          h-[128px]
                          w-[128px]
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#554668]
                          bg-[#282136]
                        "
                      >

                        <div
                          className="
                            flex
                            h-20
                            w-20
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#554668]
                            text-5xl
                            text-[#C29AF0]
                          "
                        >
                          ✦
                        </div>

                      </div>


                      {/* Camera active */}

                      <div
                        className="
                          absolute
                          bottom-6
                          left-6
                          rounded-xl
                          border
                          border-[#3B3049]
                          bg-[#15111D]
                          px-4
                          py-2.5
                          text-sm
                          text-[#C0B4CE]
                        "
                      >
                        Camera active
                      </div>

                    </div>


                    {/* Question */}

                    <div
                      className="
                        mt-5
                        rounded-[20px]
                        border
                        border-[#3A3048]
                        bg-[#241D30]
                        p-6
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-medium
                          tracking-[0.18em]
                          text-[#B99AE8]
                        "
                      >
                        QUESTION 01
                      </p>

                      <p
                        className="
                          mt-4
                          text-lg
                          font-medium
                          leading-7
                          text-[#F5F1F8]
                        "
                      >
                        Tell me about yourself and your experience.
                      </p>

                    </div>


                    {/* Metrics */}

                    <div className="mt-4 grid grid-cols-3 gap-3">

                      <PreviewMetric
                        label="Confidence"
                        value="86%"
                        valueClass="text-[#B99AE8]"
                      />

                      <PreviewMetric
                        label="Clarity"
                        value="91%"
                        valueClass="text-[#8FD0B0]"
                      />

                      <PreviewMetric
                        label="Pace"
                        value="78%"
                        valueClass="text-[#D68FAB]"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            HOW IT WORKS
        ====================================================== */}

        <section
          id="how-it-works"
          className="
            border-t
            border-[#2C2437]
            bg-[#15111E]
            px-6
            py-24
            lg:px-10
          "
        >

          <div className="mx-auto max-w-[1100px]">

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#B99AE8]
              "
            >
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              From practice to progress.
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#AFA3BA]">
              Complete a mock interview, let SkillMirror analyze your
              performance, and use the feedback to improve your next attempt.
            </p>


            <div className="mt-12 grid gap-5 md:grid-cols-3">

              <StepCard
                number="01"
                title="Practice"
                description="Start an interview and answer questions naturally using your camera and microphone."
              />

              <StepCard
                number="02"
                title="Analyze"
                description="SkillMirror evaluates your speech, voice, visual presence, and engagement."
              />

              <StepCard
                number="03"
                title="Improve"
                description="Review your results and identify the areas that need more practice."
              />

            </div>

          </div>

        </section>


        {/* ======================================================
            FEATURES
        ====================================================== */}

        <section
          id="features"
          className="
            border-t
            border-[#2C2437]
            bg-[#110D19]
            px-6
            py-24
            lg:px-10
          "
        >

          <div className="mx-auto max-w-[1100px]">

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#B99AE8]
              "
            >
              FEATURES
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Everything you need to practice better.
            </h2>


            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <FeatureCard
                title="Video Analysis"
                description="Understand your visual presence, attention, and engagement."
              />

              <FeatureCard
                title="Speech Analysis"
                description="Track speaking pace, filler words, pauses, and clarity."
              />

              <FeatureCard
                title="Voice Insights"
                description="Understand pitch, energy, and vocal delivery."
              />

              <FeatureCard
                title="Interview History"
                description="Compare previous performances and track your progress."
              />

            </div>

          </div>

        </section>


        {/* ======================================================
            CTA
        ====================================================== */}

        <section
          className="
            border-t
            border-[#2C2437]
            bg-[#15111E]
            px-6
            py-24
            lg:px-10
          "
        >

          <div
            className="
              mx-auto
              max-w-[1100px]
              rounded-[28px]
              border
              border-[#3A3048]
              bg-[#211A2B]
              px-8
              py-14
              text-center
            "
          >

            <h2 className="text-4xl font-semibold">
              Ready to see your interview reflected back?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#AFA3BA]">
              Practice once. Understand your performance. Come back stronger.
            </p>

            <button
              onClick={handleStartInterview}
              className="
                mt-8
                rounded-xl
                bg-[#B99AE8]
                px-7
                py-4
                font-semibold
                text-[#17131F]
                transition
                hover:bg-[#C8ADEF]
              "
            >
              Start Interview →
            </button>

          </div>

        </section>

      </main>


      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer
        className="
          border-t
          border-[#2C2437]
          bg-[#110D19]
          px-6
          py-8
          lg:px-10
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1100px]
            flex-col
            items-center
            justify-between
            gap-4
            text-sm
            text-[#81768E]
            sm:flex-row
          "
        >

          <span>
            © {new Date().getFullYear()} SkillMirror AI
          </span>

          <span>
            Practice smarter. Interview better.
          </span>

        </div>

      </footer>

    </div>
  );
}


/* ==============================================================
   PREVIEW METRIC
============================================================== */

function PreviewMetric({ label, value, valueClass }) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-[#3A3048]
        bg-[#282136]
        p-4
      "
    >
      <p className="text-xs text-[#A99DB3]">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-2xl
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}


/* ==============================================================
   HOW IT WORKS CARD
============================================================== */

function StepCard({ number, title, description }) {
  return (
    <div
      className="
        rounded-[20px]
        border
        border-[#3A3048]
        bg-[#1D1727]
        p-7
        transition
        duration-200
        hover:-translate-y-1
        hover:bg-[#211A2B]
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-[#2B2238]
          text-sm
          font-semibold
          text-[#B99AE8]
        "
      >
        {number}
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-[#A99DB3]">
        {description}
      </p>

    </div>
  );
}


/* ==============================================================
   FEATURE CARD
============================================================== */

function FeatureCard({ title, description }) {
  return (
    <div
      className="
        rounded-[20px]
        border
        border-[#3A3048]
        bg-[#1D1727]
        p-6
        transition
        duration-200
        hover:-translate-y-1
        hover:bg-[#211A2B]
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-[#2B2238]
          text-lg
          text-[#B99AE8]
        "
      >
        ✦
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#A99DB3]">
        {description}
      </p>

    </div>
  );
}


export default Landing;