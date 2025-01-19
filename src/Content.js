import React, { useState, useEffect } from "react";
import "./Content.css";
// import man2 from "./people/man2.png";
// import woman25 from "./people/woman25.png";
// import woman23 from "./people/woman23.png";
// import man20 from "./people/man20.png";
// import man0 from "./people/man0.png";
// import woman1 from "./people/woman1.png";
// import man7 from "./people/man7.png";
// import woman7 from "./people/woman7.png";
// import man18 from "./people/man18.png";
// import woman24 from "./people/woman24.png";

import f18_1 from "./people/1f18.png";
import f18_2 from "./people/2f18.png";
import f18_3 from "./people/3f18.png";
import f18_4 from "./people/4f18.png";
import f18_5 from "./people/5f18.png";

import f30_1 from "./people/1f30.png";
import f30_2 from "./people/2f30.png";
import f30_3 from "./people/3f30.png";
import f30_4 from "./people/4f30.png";
import f30_5 from "./people/5f30.png";

import f50_1 from "./people/1f50.png";
import f50_2 from "./people/2f50.png";
import f50_3 from "./people/3f50.png";
import f50_4 from "./people/4f50.png";
import f50_5 from "./people/5f50.png";

import r18_1 from "./people/1r18.png";
import r18_2 from "./people/2r18.png";
import r18_3 from "./people/3r18.png";
import r18_4 from "./people/4r18.png";
import r18_5 from "./people/5r18.png";

import r30_1 from "./people/1r30.png";
import r30_2 from "./people/2r30.png";
import r30_3 from "./people/3r30.png";
import r30_4 from "./people/4r30.png";

import r50_1 from "./people/1r50.png";
import r50_2 from "./people/2r50.png";
import r50_3 from "./people/3r50.png";
import r50_4 from "./people/4r50.png";
import r50_5 from "./people/5r50.png";

// Organize images by category
const imagesByCategory = {
  fake: {
    18: [f18_1, f18_2, f18_3, f18_4, f18_5],
    30: [f30_1, f30_2, f30_3, f30_4, f30_5],
    50: [f50_1, f50_2, f50_3, f50_4, f50_5],
  },
  real: {
    18: [r18_1, r18_2, r18_3, r18_4, r18_5],
    30: [r30_1, r30_2, r30_3, r30_4],
    50: [r50_1, r50_2, r50_3, r50_4, r50_5],
  },
};

// Function to randomly select images with balanced distribution
const selectRandomImages = () => {
  const selectedImages = [];
  const targetCounts = {
    18: { min: 2, max: 3 },
    30: { min: 2, max: 3 },
    50: { min: 2, max: 3 },
  };

  // Helper function to get random element from array
  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // First, ensure minimum counts for each age group
  Object.entries(targetCounts).forEach(([age, { min }]) => {
    for (let i = 0; i < min; i++) {
      // Randomly choose between real and fake
      const type = Math.random() < 0.5 ? "real" : "fake";
      const availableImages = imagesByCategory[type][age].filter(
        (img) => !selectedImages.includes(img)
      );
      if (availableImages.length > 0) {
        selectedImages.push(getRandomElement(availableImages));
      }
    }
  });

  // Fill remaining slots randomly while maintaining balance
  while (selectedImages.length < 8) {
    const age = getRandomElement(["18", "30", "50"]);
    const type = Math.random() < 0.5 ? "real" : "fake";
    const availableImages = imagesByCategory[type][age].filter(
      (img) => !selectedImages.includes(img)
    );

    if (availableImages.length > 0) {
      selectedImages.push(getRandomElement(availableImages));
    }
  }

  return selectedImages;
};

function Content() {
  const [currentScreen, setCurrentScreen] = useState("background");
  const [isPrimed, setIsPrimed] = useState(null);
  const [backgroundInfo, setBackgroundInfo] = useState({
    age: "",
    gender: "",
    race: "",
    fashionKnowledge: "",
    aiExperience: "",
  });

  // Select random images when component mounts
  const [imageList] = useState(() => selectRandomImages());
  console.log(imageList);
  const [responses, setResponses] = useState(() =>
    Array(imageList.length)
      .fill()
      .map(() => ({
        isDeepfake: null,
        explanation: "",
        confidence: 5, // Default confidence value
      }))
  );

  const handleResponse = (index, isDeepfake) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], isDeepfake };
    setResponses(newResponses);
  };

  const handleExplanation = (index, explanation) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], explanation };
    setResponses(newResponses);
  };

  const handleBackgroundChange = (field, value) => {
    setBackgroundInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isAllResponsesComplete = () => {
    return responses.every(
      (response) =>
        response.isDeepfake !== null && response.explanation.trim() !== ""
    );
  };

  // Add participantId state
  const [participantId] = useState(
    () => "P" + Math.random().toString(36).substr(2, 9)
  );

  // Fetch priming status when component mounts
  useEffect(() => {
    const fetchPrimingStatus = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbx0S8FI9RqRcrSSrC53W6zkxrlmggHRo4pLR88QLkwWUQOeUSUHVjtjRy5MItNpGCJE/exec",
          {
            method: "GET",
          }
        );
        const result = await response.json();
        if (result.success) {
          setIsPrimed(result.shouldPrime);
        }
      } catch (error) {
        console.error("Error fetching priming status:", error);
      }
    };

    fetchPrimingStatus();
  }, []);

  // Add timestamp states
  const [timestamps, setTimestamps] = useState({
    pageLoad: new Date().toISOString(),
    startPrime: null,
    startResponse: null,
    endResponse: null,
  });

  // Add confidence handler
  const handleConfidence = (index, confidence) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], confidence };
    setResponses(newResponses);
  };

  // Update screen transitions to record timestamps
  const startPriming = () => {
    setTimestamps((prev) => ({
      ...prev,
      startPrime: new Date().toISOString(),
    }));
    setCurrentScreen("priming");
  };

  const startMainSurvey = () => {
    setTimestamps((prev) => ({
      ...prev,
      startResponse: new Date().toISOString(),
    }));
    setCurrentScreen("main");
  };

  // Update submit function
  const submitData = async () => {
    const endTime = new Date().toISOString();
    setTimestamps((prev) => ({ ...prev, endResponse: endTime }));
    setCurrentScreen("thank-you");

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbx0S8FI9RqRcrSSrC53W6zkxrlmggHRo4pLR88QLkwWUQOeUSUHVjtjRy5MItNpGCJE/exec",
        {
          method: "POST",
          body: JSON.stringify({
            participantId,
            backgroundInfo,
            responses: responses.map((response, index) => ({
              imageUrl: imageList[index],
              isDeepfake: response.isDeepfake,
              explanation: response.explanation,
              confidence: response.confidence,
            })),
            isPrimed,
            timestamps: { ...timestamps, endResponse: endTime },
          }),
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Add priming screen content
  const general = `
  Test your knowledge by finding the deepfake faces.
  `;
  const primed = (
    <>
      {general}
      <br />
      <b style={{ color: "red" }}>
        AI GENERATED FACES OFTEN DISPLAY OUTDATED MAKEUP OR FACIAL AESTHETICS
      </b>
    </>
  );
  if (currentScreen === "priming" && isPrimed !== null) {
    return (
      <div className="content-container">
        <div className="background-form">
          <h1>Before We Begin</h1>
          {isPrimed ? (
            // Content for primed group
            <div>
              <p>{primed}</p>
            </div>
          ) : (
            // Content for control group
            <div>
              <p>{general}</p>
            </div>
          )}
          <button className="primary-button" onClick={startMainSurvey}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Modify background screen to go to priming screen instead of main
  if (currentScreen === "background") {
    return (
      <div className="content-container">
        <h1>Background Information</h1>
        <p>
          Please help us understand your perspective better by answering these
          questions:
        </p>

        <div className="background-form">
          <div className="form-group">
            <label>Age:</label>
            <input
              type="number"
              value={backgroundInfo.age}
              onChange={(e) => handleBackgroundChange("age", e.target.value)}
              placeholder="Your age"
            />
          </div>

          <div className="form-group">
            <label>Gender:</label>
            <select
              value={backgroundInfo.gender}
              onChange={(e) => handleBackgroundChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label>Race/Ethnicity:</label>
            <select
              value={backgroundInfo.race}
              onChange={(e) => handleBackgroundChange("race", e.target.value)}
            >
              <option value="">Select race/ethnicity</option>
              <option value="asian">Asian</option>
              <option value="black">Black or African American</option>
              <option value="hispanic">Hispanic or Latino</option>
              <option value="white">White</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              How would you rate your knowledge of current fashion trends?
            </label>
            <select
              value={backgroundInfo.fashionKnowledge}
              onChange={(e) =>
                handleBackgroundChange("fashionKnowledge", e.target.value)
              }
            >
              <option value="">Select level</option>
              <option value="expert">
                Expert - I closely follow fashion/beauty trends and notice
                subtle style changes as they happen
              </option>
              <option value="good">
                Good - I actively follow trends and can spot when styles become
                outdated
              </option>
              <option value="moderate">
                Moderate - I follow some fashion content and generally know
                what's in style
              </option>
              <option value="basic">
                Basic - I notice major trends but don't actively follow fashion
              </option>
              <option value="limited">
                Very Limited - I rarely notice trends and don't follow any
                fashion content
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>How familiar are you with AI-generated images?</label>
            <select
              value={backgroundInfo.aiExperience}
              onChange={(e) =>
                handleBackgroundChange("aiExperience", e.target.value)
              }
            >
              <option value="">Select experience level</option>
              <option value="very-experienced">
                I regularly create/work with AI-generated images
              </option>
              <option value="somewhat">
                I've experimented with AI image tools a few times
              </option>
              <option value="aware">
                I've seen AI-generated images but never created them
              </option>
              <option value="minimal">
                I know very little about AI-generated images
              </option>
              <option value="none">
                I have no experience with AI-generated images
              </option>
            </select>
          </div>

          <button
            className="primary-button"
            onClick={startPriming}
            disabled={Object.values(backgroundInfo).some(
              (value) => value === ""
            )}
          >
            Start Survey
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === "thank-you") {
    return (
      <div className="content-container thank-you-screen">
        <h1>Thank You!</h1>
        <p>
          Your responses have been recorded. We appreciate your participation in
          this study.
        </p>
      </div>
    );
  }

  return (
    <div className="content-container">
      {imageList.map((imageUrl, index) => (
        <div key={index} className="image-card">
          <img
            src={imageUrl}
            alt={`Image ${index + 1}`}
            className="content-image"
          />

          <div className="button-group">
            <button
              className={`response-button ${
                responses[index].isDeepfake === false ? "selected" : ""
              }`}
              onClick={() => handleResponse(index, false)}
            >
              Real
            </button>
            <button
              className={`response-button ${
                responses[index].isDeepfake === true ? "selected" : ""
              }`}
              onClick={() => handleResponse(index, true)}
            >
              Deepfake
            </button>
          </div>

          <div className="confidence-slider">
            <label>Confidence (0-10):</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="10"
                value={responses[index].confidence}
                onChange={(e) =>
                  handleConfidence(index, parseInt(e.target.value))
                }
                className="slider"
              />
              <span className="confidence-value">
                {responses[index].confidence}
              </span>
            </div>
          </div>

          <textarea
            className="explanation-input"
            placeholder="Why do you think so?"
            value={responses[index].explanation}
            onChange={(e) => handleExplanation(index, e.target.value)}
          />
        </div>
      ))}

      {isAllResponsesComplete() ? (
        <button className="primary-button submit-button" onClick={submitData}>
          Submit Responses
        </button>
      ) : (
        <button className="primary-button submit-button" disabled>
          Please complete all responses before submitting
        </button>
      )}
    </div>
  );
}

export default Content;
