import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import QuestionCard from "./QuestionCard";
import Timer from "./Timer";
import NavigationButtons from "./NavigationButtons";
import ProgressBar from "./ProgressBar";
// import QuestionNavigationPanel from "./QuestionNavigationPanel";
import "./css/TestPage.css";
import QuestionPalette from "./QuestionPalette";
const TestPage = () => {
  const { domain, level } = useParams();
  const location = useLocation();
  const examId = location.state?.examId;
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [visited, setVisited] = useState({});
  const [flagged, setFlagged] = useState({});
  const tabSwitchCount = useRef(0);
  const devToolCount = useRef(0);
  const [devToolsDetected, setDevToolsDetected] = useState(false);

  useEffect(() => {
    const fullscreenExitCount = { current: 0 }; // ref-like object

    // --- Request fullscreen on page load ---
    const requestFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        toast.error("Unable to enter fullscreen mode.");
      }
    };
    requestFullscreen();

    // --- Fullscreen change detection ---
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fullscreenExitCount.current += 1;
        toast.error(
          `You exited fullscreen! Warning (${fullscreenExitCount.current})`,
        );

        if (fullscreenExitCount.current >= 30) {
          toast.error("Fullscreen violation limit reached. Submitting exam.");
          handleSubmit();
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // --- Tab switch detection ---
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        toast.error(`Tab switch detected! (${tabSwitchCount.current})`);

        if (tabSwitchCount.current >= 20) {
          toast.error("Multiple tab switches detected. Submitting exam.");
          handleSubmit();
        }
      } else {
        toast("Returned to exam tab");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // --- DevTools detection ---
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if ((widthThreshold || heightThreshold) && !devToolsDetected) {
        setDevToolsDetected(true);
        devToolCount.current += 1;
        toast.error(`DevTools detected (${devToolCount.current})`);
        if (devToolCount.current >= 20) {
          toast.error("Multiple violations. Submitting exam.");
          handleSubmit();
        }
      }
    };
    const devToolsInterval = setInterval(detectDevTools, 1500);

    // --- Cleanup ---
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(devToolsInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs only once

  useEffect(() => {
    if (!examId) {
      toast.error("Exam not started properly!");
      navigate("/UserDashboard");
    }
  }, [examId, navigate]);
  useEffect(() => {
    setVisited((prev) => ({
      ...prev,
      [currentStep]: true,
    }));
  }, [currentStep]);
  const toggleFlag = (id) => {
    setFlagged((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const examState = {
      answers,
      currentStep,
      timeLeft,
      visited,
      flagged,
    };

    localStorage.setItem("examState", JSON.stringify(examState));
  }, [answers, currentStep, timeLeft, visited, flagged]);
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/api/mcq?domain=${domain}&level=${level}`);
        const data = res.data.sort((a, b) => a.step - b.step);
        setQuestions(data);
        const saved = localStorage.getItem("examState");
        const totalTime =
          data.reduce((sum, q) => sum + (q.timeLimit || 0), 0) * 60;

        if (saved) {
          const parsed = JSON.parse(saved);

          setAnswers(parsed.answers || {});
          setCurrentStep(parsed.currentStep || 0);
          setTimeLeft(parsed.timeLeft || totalTime);
          setVisited(parsed.visited || {});
          setFlagged(parsed.flagged || {});
        } else {
          setTimeLeft(totalTime);
        }
      } catch {
        toast.error("Failed to load questions");
      }
    };
    fetchQuestions();
  }, [domain, level]);

  useEffect(() => {
    if (questions.length === 0) return; // WAIT until questions load

    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted, questions]);
  const handleAnswerSelect = (qid, ans) =>
    setAnswers({ ...answers, [qid]: ans });
  const handleNext = () => setCurrentStep((s) => s + 1);
  const handlePrev = () => setCurrentStep((s) => s - 1);
  const handleJump = (step) => setCurrentStep(step);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const score = questions.filter(
        (q) => answers[q._id] === q.correctAnswer,
      ).length;
      await api.post(`/api/exam/submit/${examId}`, { answers, score });
      localStorage.removeItem("examState");
      navigate("/result", { state: { questions, answers } });
    } catch {
      toast.error("Failed to submit exam");
    }
  };
  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", blockBack);

    return () => window.removeEventListener("popstate", blockBack);
  }, []);
  useEffect(() => {
    const preventCopy = (e) => e.preventDefault();

    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("contextmenu", preventCopy);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("contextmenu", preventCopy);
    };
  }, []);
  useEffect(() => {
    if (!examId) return;

    console.log("Starting autosave with examId:", examId);
    const autoSave = setInterval(async () => {
      try {
        const result = await api.post(`/api/exam/autosave/${examId}`, {
          answers,
          timeLeft,
        });
        console.log("auto", result);
      } catch (err) {
        console.log("Auto save failed");
      }
    }, 5000);

    return () => clearInterval(autoSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);
  if (questions.length === 0) return <p>Loading questions...</p>;

  return (
    <div className="container">
      <h2>
        {domain} Level {level} Test
      </h2>
      <Timer timeLeft={timeLeft} onTimeOut={handleSubmit} />
      <ProgressBar currentStep={currentStep} totalSteps={questions.length} />
      {/* <QuestionNavigationPanel
        totalSteps={questions.length}
        currentStep={currentStep}
        answers={answers}
        visited={visited}
        onJump={handleJump}
        questions={questions}
        flagged={flagged}
      /> */}
      <div className="exam-layout">
        <div className="exam-main">
          <QuestionCard
            questionData={questions[currentStep]}
            selectedAnswer={answers[questions[currentStep]._id]}
            onAnswerSelect={handleAnswerSelect}
            toggleFlag={toggleFlag}
            flagged={flagged}
            mode="test"
            currentStep={currentStep}
            totalSteps={questions.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="exam-sidebar">
          <QuestionPalette
            questions={questions}
            answers={answers}
            visited={visited}
            currentStep={currentStep}
            flagged={flagged}
            onJump={handleJump}
          />
        </div>
      </div>
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TestPage;
