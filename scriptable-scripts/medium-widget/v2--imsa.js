// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;
const dataUrl = "https://wiebeego.github.io/test-images/json/imsa-sebring.json";
const raceIdx = 0;
const now = new Date();

let options = {
    width: 338, // Adjusted width for system medium widget
    height: 158, // Adjusted height for better fit
    font: {
        header: ["HiraginoSans-W7", 14],
        title: ["HiraginoSans-W6", 12],
        body: ["HiraginoSans-W4", 10]
    },
    padding: {
        left: 12,
        right: 12
    },
    spaceBelowTitle: 20, // Spacing below the title
    spaceBetweenRows: 6, // Spacing between rows of sessions
    spaceBetweenColumns: 2 // Spacing between columns
};

async function finished(time, raceTimeZone) {
    // Convert session time (time) to the correct time zone (Amsterdam or the race's time zone)
    const adjustedTime = await adjustForTimeZone(time, raceTimeZone);

    // Convert the current time (now) to the same time zone (Amsterdam or the race's time zone)
    const now = new Date();  // Current time in local time zone
    const adjustedNow = await adjustForTimeZone(now, raceTimeZone);

    // Convert both adjusted times to timestamps for comparison
    const sessionTimestamp = adjustedTime.getTime();
    const nowTimestamp = now.getTime();

    // Compare the timestamps
    return sessionTimestamp < nowTimestamp ? 0.5 : 1;
}

let widget = await createWidget();
Script.setWidget(widget);
widget.presentMedium(); // Correct size for system medium widget
Script.complete();

async function formatSessionDay(sessionDate, raceTimeZone) {
    // Convert the sessionDate to a Date object
    const raceDateTime = new Date(sessionDate);

    // Get the time zone offset for the race's time zone
    const raceTimeZoneOffset = getTimeZoneOffset(raceTimeZone, raceDateTime);

    // Get the time zone offset for Amsterdam
    const amsterdamTimeZone = "Europe/Amsterdam";
    const amsterdamTimeZoneOffset = getTimeZoneOffset(amsterdamTimeZone, raceDateTime);

    // Calculate the difference in offsets
    const offsetDifference = amsterdamTimeZoneOffset - raceTimeZoneOffset;

    // Adjust the raceDateTime by the offset difference
    const amsterdamDateTime = new Date(raceDateTime.getTime() + offsetDifference * 60 * 1000);

    // Format the adjusted date in the desired output format (day)
    var options = { weekday: 'short' };
    return amsterdamDateTime.toLocaleDateString('nl-NL', options);
}

async function formatSessionDate(sessionDate, raceTimeZone) {
    // Convert the sessionDate to a Date object
    const raceDateTime = new Date(sessionDate);

    // Get the time zone offset for the race's time zone
    const raceTimeZoneOffset = getTimeZoneOffset(raceTimeZone, raceDateTime);

    // Get the time zone offset for Amsterdam
    const amsterdamTimeZone = "Europe/Amsterdam";
    const amsterdamTimeZoneOffset = getTimeZoneOffset(amsterdamTimeZone, raceDateTime);

    // Calculate the difference in offsets
    const offsetDifference = amsterdamTimeZoneOffset - raceTimeZoneOffset;

    // Adjust the raceDateTime by the offset difference
    const amsterdamDateTime = new Date(raceDateTime.getTime() + offsetDifference * 60 * 1000);

    // Format the adjusted date in the desired output format (month/day)
    var options = { month: 'numeric', day: 'numeric' };
    return amsterdamDateTime.toLocaleDateString('nl-NL', options);
}

async function formatSessionTime(sessionDate, sessionTime, raceTimeZone) {
    // Combine the date and time to create a full ISO string
    const dateTimeString = `${sessionDate}T${sessionTime}`;

    // Create a Date object from the ISO string
    const raceDateTime = new Date(dateTimeString);

    // Get the time zone offset in minutes for the race's local time zone
    const raceTimeZoneOffset = getTimeZoneOffset(raceTimeZone, raceDateTime);

    // Get the time zone offset in minutes for Amsterdam
    const amsterdamTimeZone = "Europe/Amsterdam";
    const amsterdamTimeZoneOffset = getTimeZoneOffset(amsterdamTimeZone, raceDateTime);

    // Calculate the difference in offsets
    const offsetDifference = amsterdamTimeZoneOffset - raceTimeZoneOffset;

    // Adjust the raceDateTime by the offset difference
    const amsterdamDateTime = new Date(raceDateTime.getTime() + offsetDifference * 60 * 1000);

    // Format the date in the desired output format
    const hours = String(amsterdamDateTime.getUTCHours()).padStart(2, '0');
    const minutes = String(amsterdamDateTime.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getTimeZoneOffset(timeZone, date) {
    // This function should return the time zone offset in minutes for the given time zone and date
    // You can use a library like `tz-offset` or implement a custom solution
    // For simplicity, we'll use a hardcoded offset for demonstration purposes
    const timeZoneOffsets = {
        "America/New_York": -300, // Eastern Time (UTC-5)
        "Europe/Amsterdam": 60    // Central European Time (UTC+1)
    };
    return timeZoneOffsets[timeZone];
}

async function adjustForTimeZone(date, raceTimeZone) {
    const raceDateTime = new Date(date);  // Ensure the date is a Date object
    const raceTimeZoneOffset = getTimeZoneOffset(raceTimeZone, raceDateTime);  // Get the race's time zone offset
    const amsterdamTimeZone = "Europe/Amsterdam";
    const amsterdamTimeZoneOffset = getTimeZoneOffset(amsterdamTimeZone, raceDateTime);  // Amsterdam offset

    // Calculate the difference in offsets
    const offsetDifference = amsterdamTimeZoneOffset - raceTimeZoneOffset;

    // Adjust the date by the offset difference
    const adjustedDateTime = new Date(raceDateTime.getTime() + offsetDifference * 60 * 1000);

    return adjustedDateTime;
}



async function createWidget() {
    const widget = new ListWidget();
    
    // Get the race data
    const data = await new Request(dataUrl).loadJSON();
    const race = data.MRData.RaceTable.Races[raceIdx];
    const raceDateTime = new Date(`${race.date}T${race.time}`);
    const fp1 = race.FirstPractice;
    const fp1DateTime = new Date(`${fp1.date}T${fp1.time}`);
    const quali = race.Qualifying;
    const qualiDateTime = new Date(`${quali.date}T${quali.time}`);
    const timeZone = race.timeZone;

    let sprintQ, fp2sprintQDateTime, sprint, fp3sprintDateTime, fp2, fp3, sprintOrSP, isSprint = Object.hasOwn(race, 'Sprint');

    let dateTime = [];
    dateTime[0] = {
        title: 'FP1',
        day: await formatSessionDay(fp1DateTime, race.timeZone),
        date: await formatSessionDate(fp1DateTime, race.timeZone),
        time: await formatSessionTime(fp1.date, fp1.time, race.timeZone), // Pass both date and time
        raw: fp1DateTime
    };

    sprintOrSP = isSprint ? race.SprintQualifying : race.SecondPractice;
    fp2sprintQDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`);

    dateTime[1] = {
        title: isSprint ? 'SQ' : 'FP2',
        day: await formatSessionDay(fp2sprintQDateTime, race.timeZone),
        date: await formatSessionDate(fp2sprintQDateTime, race.timeZone),
        time: await formatSessionTime(sprintOrSP.date, sprintOrSP.time, race.timeZone), // Pass both date and time
        raw: fp2sprintQDateTime
    };

    sprintOrSP = isSprint ? race.Sprint : race.ThirdPractice;
    fp3sprintDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`);

    dateTime[2] = {
        title: isSprint ? 'SPR' : 'FP3',
        day: await formatSessionDay(fp3sprintDateTime, race.timeZone),
        date: await formatSessionDate(fp3sprintDateTime, race.timeZone),
        time: await formatSessionTime(sprintOrSP.date, sprintOrSP.time, race.timeZone), // Pass both date and time
        raw: fp3sprintDateTime
    };

    dateTime[3] = {
        title: 'QUAL',
        day: await formatSessionDay(qualiDateTime, race.timeZone),
        date: await formatSessionDate(qualiDateTime, race.timeZone),
        time: await formatSessionTime(quali.date, quali.time, race.timeZone), // Pass both date and time
        raw: qualiDateTime
    };

    dateTime[4] = {
        title: 'RACE',
        day: await formatSessionDay(raceDateTime, race.timeZone),
        date: await formatSessionDate(raceDateTime, race.timeZone),
        time: await formatSessionTime(race.date, race.time, race.timeZone), // Pass both date and time
        raw: raceDateTime
    };

    // Try to load the image from the URL based on the race index
    const raceImageUrl = `https://wiebeego.github.io/test-images/images/imsa/${raceIdx + 1}.jpg`;
    let backgroundImage = await loadImage(raceImageUrl);

    // If the image couldn't be loaded, use the default backup image (1.jpg)
    if (!backgroundImage) {
        backgroundImage = await loadImage('https://wiebeego.github.io/test-images/images/imsa/2.jpg');
    }

    // Set the image as the background
    widget.backgroundImage = backgroundImage;

    const headerStack = widget.addStack();
    const countryFlags = {
        "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Italy": "🇮🇹", "France": "🇫🇷", "Germany": "🇩🇪", "Spain": "🇪🇸", "Canada": "🇨🇦", "Brazil": "🇧🇷", "Australia": "🇦🇺", "Japan": "🇯🇵", "Mexico": "🇲🇽", "Netherlands": "🇳🇱", "Bahrain": "🇧🇭", "Saudi Arabia": "🇸🇦", "UAE": "🇦🇪", "Qatar": "🇶🇦", "Singapore": "🇸🇬", "Azerbaijan": "🇦🇿", "Monaco": "🇲🇨", "Austria": "🇦🇹", "Hungary": "🇭🇺", "Belgium": "🇧🇪"
    };
    let country = race.Circuit.Location.country;
    let flag = countryFlags[country] || "🏁";
    let headerText = `${flag} ${race.raceName.toUpperCase()}`;
    const headerCell = headerStack.addStack();
    headerCell.size = new Size(options.width, 0);
    headerCell.textColor = Color.white();
    headerCell.addSpacer();

    const textElement = headerCell.addText(headerText);
    textElement.font = new Font(...options.font.header);
    textElement.minimumScaleFactor = 0.5;
    textElement.lineLimit = 1;

    headerCell.addSpacer();
    widget.addSpacer(options.spaceBelowTitle); // Spacing below the title

    let body = widget.addStack();
    body.size = new Size(options.width, 0);

    for (let column = 0; column < dateTime.length; column++) {
        let currentColumn = body.addStack();
        currentColumn.layoutVertically();
        currentColumn.setPadding(0, options.padding.left, 0, options.padding.right);

        for (let row in dateTime[column]) {
            if (row == 'raw') continue;
            let currentCell = currentColumn.addStack();
            currentCell.addSpacer();
            let cellText = currentCell.addText(dateTime[column][row]);

            if (row == 'title') {
                cellText.font = new Font(...options.font.title); // Ensure all titles use the same font size
                cellText.minimumScaleFactor = 1.0; // Prevent any shrinking for title text
            } else {
                cellText.font = new Font(...options.font.body);
            }

            cellText.textColor = Color.white();
            cellText.lineLimit = 1;
            cellText.minimumScaleFactor = 0.5;
            cellText.textOpacity = await finished(dateTime[column].raw, race.timeZone);
            currentCell.addSpacer();
            currentColumn.addSpacer(options.spaceBetweenRows); // Spacing between rows of sessions
        }
        currentColumn.addSpacer(options.spaceBetweenColumns); // Spacing between columns
    }

    return widget;
}



// Function to load the image
async function loadImage(url) {
    try {
        const req = new Request(url);
        return await req.loadImage();
    } catch (error) {
        console.error("Image load failed:", error);
        return null;
    }
}