import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import Papa from "papaparse";
import {MusicFilter, MusicLibrary} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicLibrary";
import {PresetName} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/Presets";
import {randomInt} from "system/Constants/GameConstants";

//https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit#gid=0


export type MusicObject = {
    team: string,
    videoId: string,
    title: string,
    answers: string[],
    artists: string[],
}
type MusicCSVEntry = {
    team: string,
    video: string,
    title: string,
    artistMain?: string,
    artistSub?: string,
    ko_translate: string,
    ko_read: string,
    en_read: string,
    sub1: string,
    sub2: string,
    sub3: string,
}

function parseVideoEntry(item: MusicCSVEntry) {
    const obj: MusicObject = {
        team: item.team,
        videoId: InputManager.cleanseVid(item.video),
        title: item.title,
        answers: [],
        artists: [],
    };
    const answers = [item.ko_translate, item.ko_read, item.en_read, item.sub1, item.sub2, item.sub3];
    obj.answers = answers.filter((ans) => {
        if (ans === undefined) return false;
        return ans.length > 0;
    });
    obj.artists = [...parseArtistTag(item.artistMain), ...parseArtistTag(item.artistSub)];
    if (obj.artists.length === 0) obj.artists.push("");//Ensures at least 1 object.
    return obj;
}

function parseArtistTag(tag?: string): string[] {
    if (tag === undefined || tag === null || tag.length === 0) return [];
    return tag.split("/");
}

export class MusicManager {
    public static CurrentLibrary: MusicLibrary;
    public static MusicList: MusicObject[] = [];
    private static PresetLibrary = new Map<PresetName, MusicLibrary>();
    private static useArtists = false;

    public static parseCSV(results: any, presetName: PresetName, onException: any = () => {
    }) {
        const rows = results.data as MusicCSVEntry[]; // array of objects
        const library = new MusicLibrary();
        library.clear();
        let line = 0;
        let lastItem = null;
        try {
            rows.forEach((item: MusicCSVEntry) => {
                    lastItem = item;
                    if (item.video === undefined) return;
                    const obj = parseVideoEntry(item);
                    library.put(obj);
                    line++;
                }
            );
        } catch (e: any) {
            console.warn(e.stack);
            onException(`${line}줄 부근:${JSON.stringify(lastItem)} `);
            return false;
        }
        this.PresetLibrary.set(presetName, library);
        // console.log(presetName, library);
        return true;
    }

    public static async loadPreset(presetName: PresetName) {
        const response = await fetch(`presets/${presetName}.csv`)!;
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        const success = this.parseCSV(results, presetName, (a: any) => {
            console.warn(presetName + ": " + a);
        });
        if (success) {
            this.selectLibrary(presetName);
        }
        return success;
    };

    public static selectLibrary(presetName: PresetName): boolean {
        if (!this.PresetLibrary.has(presetName)) {
            return false;
        }
        this.CurrentLibrary = this.PresetLibrary.get(presetName)!;
        this.buildRandomList();
        return true;
    }

    public static pushHeader(filter: MusicFilter): number {
        if (!MusicManager.CurrentLibrary.updateHeader(filter)) {
            return 0;
        }
        return MusicManager.buildRandomList();
    }

    public static pushArtists(useArtists: boolean): number {
        this.useArtists = useArtists;
        return MusicManager.buildRandomList();
    }

    public static buildRandomList(): number {
        console.log(this.useArtists);
        this.MusicList = this.CurrentLibrary.applyFilter(this.useArtists);
        return this.MusicList.length;
    }

    public static getMusic(vid: string): MusicObject | null {
        return this.CurrentLibrary.get(vid);
    }

    public static pollNext(counter: number): MusicEntry | null {
        if (counter >= this.MusicList.length) return null;
        return {
            counter: counter,
            seed: randomInt(0, 100),
            music: this.MusicList[counter],
            status: MusicStatus.Playing,
        };
    }

    public static checkAnswer(music: MusicObject, myAnswer: string, checkArtist: boolean): boolean {
        if (myAnswer.length <= 0) return false;
        if (music === null) return false;
        const ansParts = myAnswer.split("-");
        const correctSongName = this.checkSongName(music, ansParts[0]);
        if (!checkArtist || !correctSongName) return correctSongName;
        return this.checkArtists(music, ansParts[1]);
    }

    public static addPoints(player: PlayerEntry) {
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_wins, 1);
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_totalWin, 1);
    }

    private static checkSongName(music: MusicObject, myAnswer: string): boolean {
        myAnswer = InputManager.cleanseAnswer(myAnswer);

        let correct = false;
        music.answers.forEach((value) => {
            if (correct) return;
            const realAns = InputManager.cleanseAnswer(value);
            if (realAns === myAnswer) {
                correct = true;
            }
        });
        return correct;
    }

    private static checkArtists(music: MusicObject, myAnswer?: string): boolean {
        //It has no answer. you are always correct
        if (music.artists.length === 0) return true;
        if (music.artists.length === 1 && music.artists[0].length === 0) return true;
        //It has answer but you didnt write any. you are always wrong
        if (myAnswer === undefined || myAnswer.length === 0) return false;
        return this.easyCheck(music, myAnswer);
    }

    private static easyCheck(music: MusicObject, myAnswer: string) {
        const myArtists = InputManager.cleanseAnswer(myAnswer);
        //Now artists hs cleansed multiples.
        //aa:bb/cc
        let correct = false;
        music.artists.forEach((artistTags) => {
            if (correct) return;
            let allFound = true; // need to find both aa and bb
            artistTags.split(":").forEach((value) => {
                if (!allFound) return;
                const criteria = InputManager.cleanseAnswer(value);
                if (!myArtists.includes(criteria)) {
                    allFound = false;
                }
            });
            if (allFound) {
                correct = true;
            }
        });
        return correct;
    }

    private static hardCheck(music: MusicObject, myAnswer: string) {
        const myArtists = myAnswer.split(",").map((value) => {
            return InputManager.cleanseAnswer(value);
        });
        //Now artists hs cleansed multiples.
        //aa:bb/cc
        let correct = false;
        music.artists.forEach((artistTags) => {
            if (correct) return;
            const requiredArtists: string[] = artistTags.split(":").map((value) => {
                return InputManager.cleanseAnswer(value);
            });
            //Not same number. it is wrong
            if (requiredArtists.length !== myArtists.length) return;
            let allFound = true; // need to find both aa and bb
            //Is ALl my artist answer in answer criteria?
            myArtists.forEach((artist: string) => {
                if (!allFound) return;
                if (!requiredArtists.includes(artist)) {
                    allFound = false;
                }
            });
            if (allFound) {
                correct = true;
            }
        });
        return correct;
    }
}
