// GetDilemmaScreen.js
import React from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Switch } from "react-native";

const GetDilemmaScreen = () => {
  const [loading, setLoading] = React.useState(false);
  const [generatedText, setGeneratedText] = React.useState("");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dilemmaGenerated, setDilemmaGenerated] = React.useState(false);
  const [answers, setAnswers] = React.useState({
    firstAnswer: "Agree",
    secondAnswer: "Disagree"
  });
  const [teases, setTeases] = React.useState({
    teaseOption1: "",
    teaseOption2: ""
  });
  const [selectedTease, setSelectedTease] = React.useState("");
  const [choiceMade, setChoiceMade] = React.useState(false);
  const [distribution, setDistribution] = React.useState([0, 0]);

  const backendUrl = "https://tommaiberone.pythonanywhere.com/get-dilemma";

  const fetchDilemmaData = async () => {
    let response;
    let retries = 5;
    while (retries > 0) {
      try {
        response = await fetch(backendUrl, {
          method: "GET", // Assuming GET method; adjust if necessary
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.json();
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
    setDilemmaGenerated(false);
    setGeneratedText("");
    setSelectedTease("");
    setChoiceMade(false);
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
      setGeneratedText("Failed to fetch the dilemma. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice) => {
    setSelectedTease(
      choice === "first" ? teases.teaseOption1 : teases.teaseOption2
    );

    const firstRandom = Math.floor(Math.random() * 100);
    const secondRandom = 100 - firstRandom;

    if (choice === "first") {
      setDistribution([
        Math.min(firstRandom + 1, 100),
        Math.max(secondRandom - 1, 0)
      ]);
    } else {
      setDistribution([
        Math.max(firstRandom - 1, 0),
        Math.min(secondRandom + 1, 100)
      ]);
    }

    setChoiceMade(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <View style={styles.toggleContainer}>
        <Text>{isDarkMode ? "Dark Mode" : "Light Mode"}</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
        />
      </View>

      <Text style={styles.title}>Get Dilemma</Text>
      {!dilemmaGenerated ? (
        <View style={styles.buttonSpinnerContainer}>
          <Button
            onPress={fetchDilemma}
            title={loading ? "Loading..." : "Fetch Dilemma"}
            disabled={loading}
          />
          {loading && <ActivityIndicator size="small" color="#0000ff" />}
        </View>
      ) : (
        <>
          <View style={styles.generatedText}>
            <Text style={styles.boldText}>Fetched Ethical Dilemma:</Text>
            <Text>{generatedText}</Text>
          </View>
          {!choiceMade ? (
            <View style={styles.responseButtons}>
              <Button
                title={answers.firstAnswer}
                onPress={() => handleChoice("first")}
                disabled={loading}
              />
              <Button
                title={answers.secondAnswer}
                onPress={() => handleChoice("second")}
                disabled={loading}
              />
            </View>
          ) : (
            <View style={styles.teaseText}>
              <Text style={styles.boldText}>{selectedTease}</Text>

              <View style={styles.distributionBarWrapper}>
                <View style={styles.distributionOption}>
                  <Text>{answers.firstAnswer} - {distribution[0]}%</Text>
                </View>
                <View style={styles.distributionOption}>
                  <Text>{answers.secondAnswer} - {distribution[1]}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarSegment,
                      styles.firstSegment,
                      { width: `${distribution[0]}%` }
                    ]}
                  />
                  <View
                    style={[
                      styles.progressBarSegment,
                      styles.secondSegment,
                      { width: `${distribution[1]}%` }
                    ]}
                  />
                </View>
              </View>

              <Button
                onPress={fetchDilemma}
                title={loading ? "Loading..." : "Fetch New Dilemma"}
                disabled={loading}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20
  },
  buttonSpinnerContainer: {
    alignItems: 'center'
  },
  generatedText: {
    marginBottom: 20
  },
  boldText: {
    fontWeight: 'bold'
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  teaseText: {
    marginTop: 20,
    alignItems: 'center'
  },
  distributionBarWrapper: {
    width: '100%',
    marginVertical: 20
  },
  distributionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressBarSegment: {
    height: '100%'
  },
  firstSegment: {
    backgroundColor: '#4caf50'
  },
  secondSegment: {
    backgroundColor: '#f44336'
  }
});

export default GetDilemmaScreen;
