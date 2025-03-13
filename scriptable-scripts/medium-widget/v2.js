// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;
const dataUrl = "https://api.jolpi.ca/ergast/f1/current/next.json";
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

function finished(time) { return time < now ? 0.5 : 1; }

let widget = await createWidget();
Script.setWidget(widget);
widget.presentMedium(); // Correct size for system medium widget
Script.complete();

async function formatSessionDay(sessionDay) {
    var options = { weekday: 'short' };
    return sessionDay.toLocaleDateString('nl-NL', options);
}

async function formatSessionDate(sessionDate) {
    var options = { month: 'numeric', day: 'numeric' };
    return sessionDate.toLocaleDateString('nl-NL', options);
}

async function formatSessionTime(sessionTime) {
    var options = { hour12: false, hour: '2-digit', minute: '2-digit' };
    return sessionTime.toLocaleTimeString('nl-NL', options);
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

    let sprintQ, fp2sprintQDateTime, sprint, fp3sprintDateTime, fp2, fp3, sprintOrSP, isSprint = Object.hasOwn(race, 'Sprint');

    let dateTime = [];
    dateTime[0] = {
        title: 'FP1',
        day: await formatSessionDay(fp1DateTime),
        date: await formatSessionDate(fp1DateTime),
        time: await formatSessionTime(fp1DateTime),
        raw: fp1DateTime
    };

    sprintOrSP = isSprint ? race.SprintQualifying : race.SecondPractice;
    fp2sprintQDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`);

    dateTime[1] = {
        title: isSprint ? 'SQ' : 'FP2',
        day: await formatSessionDay(fp2sprintQDateTime),
        date: await formatSessionDate(fp2sprintQDateTime),
        time: await formatSessionTime(fp2sprintQDateTime),
        raw: fp2sprintQDateTime
    };

    sprintOrSP = isSprint ? race.Sprint : race.ThirdPractice;
    fp3sprintDateTime = new Date(`${sprintOrSP.date}T${sprintOrSP.time}`);

    dateTime[2] = {
        title: isSprint ? 'SPR' : 'FP3',
        day: await formatSessionDay(fp3sprintDateTime),
        date: await formatSessionDate(fp3sprintDateTime),
        time: await formatSessionTime(fp3sprintDateTime),
        raw: fp3sprintDateTime
    };

    dateTime[3] = {
        title: 'QUAL',
        day: await formatSessionDay(qualiDateTime),
        date: await formatSessionDate(qualiDateTime),
        time: await formatSessionTime(qualiDateTime),
        raw: qualiDateTime
    };

    dateTime[4] = {
        title: 'RACE',
        day: await formatSessionDay(raceDateTime),
        date: await formatSessionDate(raceDateTime),
        time: await formatSessionTime(raceDateTime),
        raw: raceDateTime
    };

    // Try to load the image from the URL based on the race index
    const raceImageUrl = `https://wiebeego.github.io/test-images/images/${raceIdx + 1}.jpg`;
    let backgroundImage = await loadImage(raceImageUrl);

    // If the image couldn't be loaded, use the default backup image (1.jpg)
    if (!backgroundImage) {
        backgroundImage = await loadImage('https://wiebeego.github.io/test-images/images/1.jpg');
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
            cellText.textOpacity = finished(dateTime[column].raw);
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
