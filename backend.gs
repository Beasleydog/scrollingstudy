// Sheet names
const BACKGROUND_SHEET_NAME = "Background Info";
const RESPONSES_SHEET_NAME = "Image Responses";
const PRIMING_SHEET_NAME = "Priming Status";

// Initialize the sheets if they don't exist
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create or get Background Info sheet
  let backgroundSheet = ss.getSheetByName(BACKGROUND_SHEET_NAME);
  if (!backgroundSheet) {
    backgroundSheet = ss.insertSheet(BACKGROUND_SHEET_NAME);
    backgroundSheet
      .getRange("A1:K1")
      .setValues([
        [
          "Participant ID",
          "Age",
          "Gender",
          "Race/Ethnicity",
          "Fashion Knowledge",
          "AI Experience",
          "Page Load Time",
          "Prime Start Time",
          "Response Start Time",
          "Response End Time",
          "Timestamp",
        ],
      ]);
  }

  // Create or get Image Responses sheet
  let responsesSheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
  if (!responsesSheet) {
    responsesSheet = ss.insertSheet(RESPONSES_SHEET_NAME);
    responsesSheet
      .getRange("A1:E1")
      .setValues([
        [
          "Participant ID",
          "Image URL",
          "Is Deepfake",
          "Confidence",
          "Explanation",
        ],
      ]);
  }

  // Create or get Priming Status sheet
  let primingSheet = ss.getSheetByName(PRIMING_SHEET_NAME);
  if (!primingSheet) {
    primingSheet = ss.insertSheet(PRIMING_SHEET_NAME);
    primingSheet.getRange("A1:B1").setValues([["Participant ID", "Primed"]]);
  }
}

// Web app endpoint to handle form submission
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const { participantId, backgroundInfo, responses, isPrimed, timestamps } =
      data;

    // Save background info
    saveBackgroundInfo(participantId, backgroundInfo, timestamps);

    // Save priming status
    savePrimingStatus(participantId, isPrimed);

    // Save image responses
    saveResponses(participantId, responses);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Data saved successfully",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Save background information to the Background Info sheet
function saveBackgroundInfo(participantId, backgroundInfo, timestamps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(BACKGROUND_SHEET_NAME);

  const rowData = [
    participantId,
    backgroundInfo.age,
    backgroundInfo.gender,
    backgroundInfo.race,
    backgroundInfo.fashionKnowledge,
    backgroundInfo.aiExperience,
    timestamps.pageLoad,
    timestamps.startPrime,
    timestamps.startResponse,
    timestamps.endResponse,
    new Date().toISOString(),
  ];

  sheet.appendRow(rowData);
}

// Save image responses to the Image Responses sheet
function saveResponses(participantId, responses) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);

  responses.forEach((response) => {
    const rowData = [
      participantId,
      response.imageUrl,
      response.isDeepfake ? "Deepfake" : "Real",
      response.confidence,
      response.explanation,
    ];
    sheet.appendRow(rowData);
  });
}

// New function to save priming status
function savePrimingStatus(participantId, isPrimed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PRIMING_SHEET_NAME);
  sheet.appendRow([participantId, isPrimed]);
}

// Generate a deployment URL that can be used by the frontend
function getDeploymentInfo() {
  const url = ScriptApp.getService().getUrl();
  return url;
}

// New function to get last participant's priming status
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PRIMING_SHEET_NAME);
    const lastRow = sheet.getLastRow();

    let shouldPrime = true; // default for first participant

    if (lastRow > 1) {
      // Get the priming status from the last row
      const lastPrimingStatus = sheet.getRange(lastRow, 2).getValue();
      // New participant should get opposite of last participant
      shouldPrime = !lastPrimingStatus;
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        shouldPrime: shouldPrime,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
