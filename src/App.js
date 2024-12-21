import React from "react";
import "./styles.css";

function App() {
  const [loading, setLoading] = React.useState(false);
  const [generatedText, setGeneratedText] = React.useState("");
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [dilemmaGenerated, setDilemmaGenerated] = React.useState(false);
  const [answers, setAnswers] = React.useState({
    firstAnswer: "Yes",
    secondAnswer: "No",
  });
  const [teases, setTeases] = React.useState({
    teaseOption1: "",
    teaseOption2: "",
  });
  const [selectedTease, setSelectedTease] = React.useState("");
  const [choiceMade, setChoiceMade] = React.useState(false);

  const backendUrl = "https://tommaiberone.pythonanywhere.com/generate-dilemma";

  const fetchDilemmaData = async () => {
    let response;
    let retries = 5;
    while (retries > 0) {
      try {
        response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

    try {
      let content = await fetchDilemmaData();
      setGeneratedText(content.dilemma.trim());
      setAnswers({
        firstAnswer: content.firstAnswer,
        secondAnswer: content.secondAnswer,
      });
      setTeases({
        teaseOption1: content.teaseOption1,
        teaseOption2: content.teaseOption2,
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
    setChoiceMade(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
  };

  return (
    <>
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
    </>
  );
}

export default App;
