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
        return true;
    }

    public static async loadPreset(presetName: PresetName) {
        const response = await fetch(`presets/${presetName}.csv`)!;
        const csv = await response.text();
        //https://stackoverflow.com/questions/54842343/papaparse-not-parsing-full-data
        /*        const reader = response.body!.getReader();
                const result = await reader.read(); // raw array
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value); // the csv text*/
        // console.log(csv);
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

    public static checkAnswer(music: MusicObject, myAnswer: string, checkArtist: boolean): number {
        if (myAnswer.length === undefined) return 0;
        if (myAnswer.length <= 0) return 0;
        if (music === null) return 0;
        const ansParts = myAnswer.split("-");
        const songPoint = this.checkSongName(music, ansParts[0]);
        if (!checkArtist) return +(songPoint.toFixed(2));
        return +((0.5 * songPoint + 0.5 * this.checkArtists(music, ansParts[1])).toFixed(2));
    }

    public static addPoints(player: PlayerEntry, points: number) {
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_wins, points);
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_totalWin, points);
    }

    private static checkSongName(music: MusicObject, myAnswer: string): number {
        myAnswer = InputManager.cleanseAnswer(myAnswer);
        let correct = false;
        if (music.answers === undefined || music.answers === null) {
            music.answers = ["?"];
            return 1;
        }
        music.answers.forEach((value) => {
            if (correct) return;
            const realAns = InputManager.cleanseAnswer(value);
            if (realAns === myAnswer) {
                correct = true;
            }
        });
        return (correct) ? 1 : 0;
    }

    private static checkArtists(music: MusicObject, myAnswer?: string): number {
        //It has no answer. you are always correct
        if (music.artists === undefined || music.artists === null) return 1;
        if (music.artists.length === 0) return 1;
        if (music.artists.length === 1 && music.artists[0].length === 0) return 1;
        //It has answer but you didnt write any. you are always wrong
        if (myAnswer === undefined || myAnswer.length === 0) return 0;
        return this.hardCheck(music, myAnswer);
    }

    private static hardCheck(music: MusicObject, myAnswer: string): number {
        const myArtists = myAnswer.split(",").map((value) => {
            return InputManager.cleanseArtistAnswer(value);
        });
        //Now artists hs cleansed multiples.
        //aa:bb/cc
        let highestPoint = 0;
        //For each answer...
        music.artists.forEach((artistTags) => {
            //You need these artists.
            const requiredArtists: string[] = artistTags.split(":").map((value) => {
                return InputManager.cleanseArtistAnswer(value);
            });
            let found = 0; // need to find both aa and bb
            //Is ALLL Criteria in My answer?
            requiredArtists.forEach((artist: string) => {
                if (myArtists.includes(artist)) {
                    found++;
                }
            });
            //YOu entered too much. lose points
            const lenDiff = myArtists.length - requiredArtists.length;
            if (lenDiff > 0) {
                found /= (lenDiff + 1);
            }
            //Get most found answer.
            highestPoint = Math.max(highestPoint, (+found / +requiredArtists.length));
        });
        return highestPoint;
    }
}
