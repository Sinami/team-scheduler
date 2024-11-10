let count = 0;
function getFilledCellsInColumnA() {
  // Get the active sheet
  const sheet = SpreadsheetApp.getActiveSheet();
  const numTeams = sheet.getRange('A1').getValue();
  // Get the data range for column A
  const dataRange = sheet.getRange("A2:A" + (numTeams + 1));
  // Get all values in the data range
  const data = dataRange.getValues();
  // Filter the values to keep only non-empty strings
  const filledCells = data.filter(cell => cell !== "");
  // Return the flattened array of filled cell values
  return filledCells.flat();
}

function checkMatchUnique(matches, roundMap, round) {
  /**
   * If match is found in matches then rerun round matching?
   * until all teams have matched
   */
    for (const [key1, innerMap] of roundMap.entries()) {
      if (key1 < round) {
      for (const [key2, value] of innerMap.entries()) {
            // Process key2 and value
          for (let i = 0; i < matches.length; i++) {
            if (matches[i][0] == key2 && matches[i][1] == value) {
              return false;
            } else if (key2 == matches[i][1] && value == matches[i][0]) {
              return false;
            }
          }
        }
      }
    }
    count++;
    console.log('Good matches.' + count);
    return true;
}

function generateSchedule() {
  const teams = getFilledCellsInColumnA();
  let n = teams.length;

  if (n < 2) {
    throw new Error("Number of teams must be at least 2.");
  }

  // Check if the number of teams is odd
  let hasBye = false;
  if (n % 2 !== 0) {
    teams.push("BYE"); // Add a dummy team for bye
    n += 1;
    hasBye = true;
  }

  const totalRounds = 12;
  const matchesPerRound = n / 2;

  // Initialize the schedule array
  const schedule = [];

  // Generate the initial team indices
  const teamIndices = [];
  for (let i = 0; i < n; i++) {
    teamIndices.push(i);
  }

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < matchesPerRound; i++) {
      const home = teams[teamIndices[i]];
      const away = teams[teamIndices[n - 1 - i]];
      if (home !== "BYE" && away !== "BYE") {
        roundMatches.push(`${home} vs. ${away}`);
      } else if (home === "BYE" && away !== "BYE") {
        roundMatches.push(`${away} has a bye`);
      } else if (home !== "BYE" && away === "BYE") {
        roundMatches.push(`${home} has a bye`);
      }
      // If both are BYE, we skip
    }
    schedule.push({ round: round + 1, matches: roundMatches });

    // Rotate the team indices for next round
    teamIndices.splice(1, 0, teamIndices.pop());
  }

   // Write the schedule to the sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Schedule");
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 2).setValues([["Round", "Matches"]]);

  let row = 2;
  for (const roundInfo of schedule) {
    sheet.getRange(row, 1).setValue(`Round ${roundInfo.round}`);
    const matches = roundInfo.matches;
    const numMatches = matches.length;
    // Write each match into its own cell starting from column 2
    sheet.getRange(row, 2, 1, numMatches).setValues([matches]);
    row++;
  }
}

