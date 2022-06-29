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

    public static buildRandomList(): number {
        this.MusicList = this.CurrentLibrary.applyFilter();
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

    public static checkAnswer(music: MusicObject, myAnswer: string): boolean {
        myAnswer = InputManager.cleanseAnswer(myAnswer);
        if (myAnswer.length <= 0) return false;
        if (music === null) return false;
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

    public static addPoints(player: PlayerEntry) {
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_wins, 1);
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_gameWins, 1);
    }
}
