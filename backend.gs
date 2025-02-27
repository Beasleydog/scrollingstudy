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

    // Save image responses
    saveResponses(participantId, responses);

    // We don't need to save priming status again since it was already saved in doGet
    // But we can update the entry to mark it as completed if needed
    // savePrimingStatus(participantId, isPrimed);

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

// Function to update priming status (now used for updating existing entries)
function savePrimingStatus(participantId, isPrimed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PRIMING_SHEET_NAME);

  // Look for the participant ID in the first column
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === participantId) {
      // Update the existing row
      sheet.getRange(i + 1, 2).setValue(isPrimed);
      return;
    }
  }

  // If not found, append a new row (fallback)
  sheet.appendRow([participantId, isPrimed]);
}

// Generate a deployment URL that can be used by the frontend
function getDeploymentInfo() {
  const url = ScriptApp.getService().getUrl();
  return url;
}

// Function to get and reserve priming status for a new participant
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(PRIMING_SHEET_NAME);
    const lastRow = sheet.getLastRow();

    // Use a counter-based approach
    // First participant (row 2, since row 1 is header) gets primed (true)
    // Even-numbered participants get unprimed (false), odd-numbered get primed (true)
    // This ensures perfect alternation because we immediately record each participant
    const participantNumber = lastRow; // If lastRow is 1 (just header), this will be 1
    const shouldPrime = participantNumber % 2 === 1; // Odd numbers get primed

    // Generate a unique participant ID
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const participantId = `p${timestamp}-${randomSuffix}`;

    // Immediately record this participant with their assigned priming status
    // This "reserves" their spot in the alternating sequence, even if they don't complete the survey
    // This prevents race conditions when multiple users start at the same time
    sheet.appendRow([participantId, shouldPrime]);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        shouldPrime: shouldPrime,
        participantId: participantId,
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
