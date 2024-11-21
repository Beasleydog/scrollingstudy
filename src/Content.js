import React, { useState, useEffect } from "react";
import "./Content.css";

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

  // Sample image URLs - replace with your actual image URLs
  const imageList = [
    "./people/man2.png",
    "./people/woman25.png",
    "./people/woman23.png",
    "./people/man20.png",
    "./people/man0.png",
    "./people/woman1.png",
    "./people/man7.png",
    "./people/woman7.png",
    "./people/man18.png",
    "./people/woman24.png",
  ];

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
  Scroll through the following images and determine whether each image is a real person or a deepfake.
  For each image, select deepfake if you think the image is a deepfake, and real if you think the image is a real person.
  Provide a brief explanation for your choice.
  `;
  const primed = (
    <>
      {general}
      <b>
        It's important to note that AI-generated faces often display outdated
        makeup styles and facial aesthetics. This is because AI models are
        typically trained on older datasets that may not reflect current beauty
        trends. Keep this in mind as you evaluate the images.
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
              <option value="expert">Expert</option>
              <option value="advanced">Advanced</option>
              <option value="intermediate">Intermediate</option>
              <option value="basic">Basic</option>
              <option value="none">No knowledge</option>
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
            placeholder="Why do you think so? (Optional)"
            value={responses[index].explanation}
            onChange={(e) => handleExplanation(index, e.target.value)}
          />
        </div>
      ))}

      {isAllResponsesComplete() && (
        <button className="primary-button submit-button" onClick={submitData}>
          Submit Responses
        </button>
      )}
    </div>
  );
}

export default Content;
