import React from "react";
import jwtDecode from "jwt-decode";
import "./styles.css";

function App() {
  const [loading, setLoading] = React.useState(false);
  const [generatedText, setGeneratedText] = React.useState("");
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [dilemmaGenerated, setDilemmaGenerated] = React.useState(false);
  const [answers, setAnswers] = React.useState({
    firstAnswer: "Yes",
    secondAnswer: "No"
  });
  const [teases, setTeases] = React.useState({
    teaseOption1: "",
    teaseOption2: ""
  });
  const [selectedTease, setSelectedTease] = React.useState("");
  const [choiceMade, setChoiceMade] = React.useState(false);

  // NEW: State to hold the mock distribution data
  // For example, distribution[0] = percentage of people that chose firstAnswer
  // and distribution[1] = percentage for secondAnswer
  const [distribution, setDistribution] = React.useState([0, 0]);

  // NEW FEATURE: store dilemma history and toggle visibility
  const [history, setHistory] = React.useState(() => {
    const stored = localStorage.getItem("dilemmaHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const [showHistory, setShowHistory] = React.useState(false);

  // Google authentication state
  const [user, setUser] = React.useState(null);

  // Interactive tutorial state - show on first visit
  const tutorialMessages = [
    "Click 'Generate' to get a new ethical dilemma.",
    "Pick an answer to reveal a teasing message and vote distribution.",
    "Check the distribution bar to see how others voted.",
    "Use the toggle in the corner to switch dark or light mode.",
    "Open the history to review or clear past dilemmas."
  ];
  const [tutorialStep, setTutorialStep] = React.useState(() => {
    return localStorage.getItem("tutorialComplete") ? null : 0;
  });

  const advanceTutorial = () => {
    if (tutorialStep === null) return;
    if (tutorialStep === tutorialMessages.length - 1) {
      setTutorialStep(null);
      localStorage.setItem("tutorialComplete", "true");
    } else {
      setTutorialStep((prev) => prev + 1);
    }
  };

  const restartTutorial = () => {
    localStorage.removeItem("tutorialComplete");
    setTutorialStep(0);
  };

  React.useEffect(() => {
    localStorage.setItem("dilemmaHistory", JSON.stringify(history));
  }, [history]);

  // Load Google Sign-In script and render button
  React.useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = (response) => {
      const data = jwtDecode(response.credential);
      setUser({ name: data.name });
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin"),
        { theme: "outline", size: "large" }
      );
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Allow overriding the backend URL via environment variable for flexibility
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL ||
    "https://tommaiberone.pythonanywhere.com/generate-dilemma";

  const fetchDilemmaData = async () => {
    let response;
    let retries = 5;
    while (retries > 0) {
      try {
        response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const content = JSON.parse(result.choices[0].message.content);
        return content;
      } catch (error) {
        console.error("Error during fetch or parsing:", error);
        retries -= 1;

        if (retries === 0) {
          throw new Error("Max retries reached. Failed to fetch valid data.");
        }
      }
    }
  };

  const fetchDilemma = async () => {
    setLoading(true);
    setDilemmaGenerated(false); // Reset this to show the spinner
    setGeneratedText("");
    setSelectedTease("");
    setChoiceMade(false);

    // Reset distribution whenever we generate a new dilemma
    setDistribution([0, 0]);

    try {
      let content = await fetchDilemmaData();
      setGeneratedText(content.dilemma.trim());
      setAnswers({
        firstAnswer: content.firstAnswer,
        secondAnswer: content.secondAnswer
      });
      setTeases({
        teaseOption1: content.teaseOption1,
        teaseOption2: content.teaseOption2
      });
      setDilemmaGenerated(true);
    } catch (error) {
      console.error("Error during backend call:", error);
      setGeneratedText("Failed to fetch the generated text. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice) => {
    setSelectedTease(
      choice === "first" ? teases.teaseOption1 : teases.teaseOption2
    );

    // Generate or mock distribution:
    // We'll produce two random numbers to total 100,
    // then slightly bump the chosen side by 1 to show a difference
    const firstRandom = Math.floor(Math.random() * 100);
    const secondRandom = 100 - firstRandom;

    let newDistribution;
    if (choice === "first") {
      // Bump the first answer by 1 if it's less than 100
      newDistribution = [
        Math.min(firstRandom + 1, 100),
        Math.max(secondRandom - 1, 0)
      ];
    } else {
      // Bump the second answer by 1 if it's less than 100
      newDistribution = [
        Math.max(firstRandom - 1, 0),
        Math.min(secondRandom + 1, 100)
      ];
    }
    setDistribution(newDistribution);

    // Save this dilemma to history for later review
    setHistory((prev) => [
      {
        id: Date.now(),
        dilemma: generatedText,
        choice:
          choice === "first" ? answers.firstAnswer : answers.secondAnswer,
        distribution: newDistribution
      },
      ...prev
    ]);

    setChoiceMade(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
  };

  const toggleHistory = () => setShowHistory((prev) => !prev);
  const clearHistory = () => setHistory([]);
  const signOut = () => {
    setUser(null);
    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <>
      {tutorialStep !== null && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <p>{tutorialMessages[tutorialStep]}</p>
            <button onClick={advanceTutorial}>
              {tutorialStep === tutorialMessages.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
      {user ? (
        <div className="user-info">
          <span>Signed in as {user.name}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div id="google-signin" className="google-signin"></div>
      )}
      <div className="toggle-container" onClick={toggleDarkMode}>
        <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
        <div className={`toggle-switch ${isDarkMode ? "active" : ""}`}></div>
      </div>

      <div className="container">
        <h1>Moral Torture Machine</h1>
        {!dilemmaGenerated ? (
          <div className="button-spinner-container">
            <button onClick={fetchDilemma} disabled={loading}>
              {loading ? "Loading..." : "Generate"}
            </button>
            {loading && <div className="spinner"></div>}
          </div>
        ) : (
          <>
            <div className="generated-text">
              <strong>Generated Ethical Dilemma:</strong>
              <p>{generatedText}</p>
            </div>
            {!choiceMade ? (
              <div className="response-buttons">
                <button
                  className="yes-button"
                  onClick={() => handleChoice("first")}
                  disabled={loading}
                >
                  {answers.firstAnswer}
                </button>
                <button
                  className="no-button"
                  onClick={() => handleChoice("second")}
                  disabled={loading}
                >
                  {answers.secondAnswer}
                </button>
              </div>
            ) : (
              <div className="tease-text">
                <p>
                  <strong>{selectedTease}</strong>
                </p>

                {/* 
                  NEW: Mock Distribution Bar 
                  Only render if user has made a choice. 
                */}
                <div className="distribution-bar-wrapper">
                  <div className="distribution-option">
                    <span>{answers.firstAnswer} - {distribution[0]}%</span>
                  </div>
                  <div className="distribution-option">
                    <span>{answers.secondAnswer} - {distribution[1]}%</span>
                  </div>
                  <div className="progress-bar-container">
                    {/* 'first' portion */}
                    <div
                      className="progress-bar-segment first-segment"
                      style={{ width: `${distribution[0]}%` }}
                    />
                    {/* 'second' portion */}
                    <div
                      className="progress-bar-segment second-segment"
                      style={{ width: `${distribution[1]}%` }}
                    />
                  </div>
                </div>

                <button
                  className="generate-new"
                  onClick={fetchDilemma}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Generate New Dilemma"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <button className="history-toggle" onClick={toggleHistory}>
        {showHistory ? "Hide History" : "Show History"}
      </button>

      <button className="tutorial-toggle" onClick={restartTutorial}>
        Tutorial
      </button>

      {showHistory && (
        <div className="history-container">
          {history.length === 0 ? (
            <p>No dilemmas answered yet.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <p className="history-dilemma">{item.dilemma}</p>
                <p className="history-choice">You chose: {item.choice}</p>
              </div>
            ))
          )}
          {history.length > 0 && (
            <button className="clear-history" onClick={clearHistory}>
              Clear History
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default App;
