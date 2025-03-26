// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;

const SCRIPT_VERSION = "1.0";
const DATA_URL = "https://api.jolpi.ca/ergast/f1/current/next.json";
const ALLDATA_URL = "https://api.jolpi.ca/ergast/f1/current/races.json";
const RACE_IDX = 0;
const now = new Date();

// File manager for caching
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.cacheDirectory(), "f1DataCache.json");

// Function to fetch data with caching
async function getData() {
    const nowMs = Date.now();
    const refreshLimit = 60 * 60 * 1000; // 1 hour
    
    if (fm.fileExists(cachePath)) {
        try {
            const cached = JSON.parse(fm.readString(cachePath));
            if (nowMs - cached.timestamp < refreshLimit) {
                console.log("Using cached data");
                return cached.data;
            }
        } catch (e) {
            console.log("Error reading cache, fetching fresh data.");
        }
    }

    try {
        const req = new Request(DATA_URL);
        req.headers = { "User-Agent": `Scriptable: F1Widget/${SCRIPT_VERSION}` };
        const data = await req.loadJSON();
        fm.writeString(cachePath, JSON.stringify({ timestamp: nowMs, data }));
        console.log("Fetched fresh data");
        return data;
    } catch (error) {
        console.log("Fetch failed, using cached data if available");
        if (fm.fileExists(cachePath)) {
            return JSON.parse(fm.readString(cachePath)).data;
        }
        return null;
    }
}

async function createWidget() {
    const widget = new ListWidget();
    const data = await getData();
    if (!data) {
        widget.addText("Failed to load data");
        return widget;
    }
    
    const race = data.MRData.RaceTable.Races[RACE_IDX];
    const raceDateTime = new Date(`${race.date}T${race.time}`);
    
    const header = widget.addText(race.raceName.toUpperCase());
    header.font = Font.boldSystemFont(14);
    widget.addSpacer(8);
    
    widget.addText(`Race: ${raceDateTime.toLocaleString()}`);
    
    return widget;
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
