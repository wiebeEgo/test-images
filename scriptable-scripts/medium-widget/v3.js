// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;
const dataUrl = "https://api.jolpi.ca/ergast/f1/current/next.json";
const raceIdx = 0;
const now = new Date();
const cacheFile = FileManager.local().joinPath(FileManager.local().cacheDirectory(), "f1_data.json");

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

async function fetchData() {
    let data;
    try {
        const req = new Request(dataUrl);
        data = await req.loadJSON();
        FileManager.local().writeString(cacheFile, JSON.stringify(data));
    } catch (e) {
        if (FileManager.local().fileExists(cacheFile)) {
            data = JSON.parse(FileManager.local().readString(cacheFile));
        } else {
            data = null;
        }
    }
    return data;
}

async function formatSessionDay(sessionDay) {
    return sessionDay.toLocaleDateString('nl-NL', { weekday: 'short' });
}

async function formatSessionDate(sessionDate) {
    return sessionDate.toLocaleDateString('nl-NL', { month: 'numeric', day: 'numeric' });
}

async function formatSessionTime(sessionTime) {
    return sessionTime.toLocaleTimeString('nl-NL', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

async function createWidget() {
    const widget = new ListWidget();
    const data = await fetchData();
    if (!data) {
        widget.addText("Failed to load data");
        return widget;
    }
    const race = data.MRData.RaceTable.Races[raceIdx];
    const raceDateTime = new Date(`${race.date}T${race.time}`);
    const fp1 = race.FirstPractice;
    const fp1DateTime = new Date(`${fp1.date}T${fp1.time}`);
    const quali = race.Qualifying;
    const qualiDateTime = new Date(`${quali.date}T${quali.time}`);

    let sprintOrSP, isSprint = Object.hasOwn(race, 'Sprint');
    let dateTime = [{
        title: 'FP1', day: await formatSessionDay(fp1DateTime), date: await formatSessionDate(fp1DateTime),
        time: await formatSessionTime(fp1DateTime), raw: fp1DateTime
    }];

    sprintOrSP = isSprint ? race.SprintQualifying : race.SecondPractice;
    dateTime.push({
        title: isSprint ? 'SQ' : 'FP2', day: await formatSessionDay(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        date: await formatSessionDate(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        time: await formatSessionTime(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        raw: new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)
    });

    sprintOrSP = isSprint ? race.Sprint : race.ThirdPractice;
    dateTime.push({
        title: isSprint ? 'SPR' : 'FP3', day: await formatSessionDay(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        date: await formatSessionDate(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        time: await formatSessionTime(new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)),
        raw: new Date(`${sprintOrSP.date}T${sprintOrSP.time}`)
    });

    dateTime.push({
        title: 'QUAL', day: await formatSessionDay(qualiDateTime), date: await formatSessionDate(qualiDateTime),
        time: await formatSessionTime(qualiDateTime), raw: qualiDateTime
    });

    dateTime.push({
        title: 'RACE', day: await formatSessionDay(raceDateTime), date: await formatSessionDate(raceDateTime),
        time: await formatSessionTime(raceDateTime), raw: raceDateTime
    });

    const raceImageUrl = `https://wiebeego.github.io/test-images/images/${raceIdx + 1}.jpg`;
    let backgroundImage = await loadImage(raceImageUrl) || await loadImage('https://wiebeego.github.io/test-images/images/1.jpg');
    widget.backgroundImage = backgroundImage;

    let headerStack = widget.addStack();
    let countryFlags = { "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Italy": "🇮🇹", "France": "🇫🇷", "Germany": "🇩🇪", "Spain": "🇪🇸", "Canada": "🇨🇦", "Brazil": "🇧🇷", "Australia": "🇦🇺", "Japan": "🇯🇵", "Mexico": "🇲🇽", "Netherlands": "🇳🇱", "Bahrain": "🇧🇭", "Saudi Arabia": "🇸🇦", "UAE": "🇦🇪", "Qatar": "🇶🇦", "Singapore": "🇸🇬", "Azerbaijan": "🇦🇿", "Monaco": "🇲🇨", "Austria": "🇦🇹", "Hungary": "🇭🇺", "Belgium": "🇧🇪" };
    let headerText = `${countryFlags[race.Circuit.Location.country] || "🏁"} ${race.raceName.toUpperCase()}`;
    let headerCell = headerStack.addStack();
    headerCell.addSpacer();
    let textElement = headerCell.addText(headerText);
    textElement.font = new Font(...options.font.header);
    textElement.minimumScaleFactor = 0.5;
    headerCell.addSpacer();
    widget.addSpacer(options.spaceBelowTitle);

    return widget;
}

async function loadImage(url) {
    try { return await new Request(url).loadImage(); } catch { return null; }
}
