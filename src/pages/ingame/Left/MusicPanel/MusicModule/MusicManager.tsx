import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import Papa from "papaparse";
import {MusicFilter, MusicLibrary} from "pages/ingame/Left/MusicPanel/MusicModule/MusicLibrary";

//https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit#gid=0


export type MusicObject = {
    team: string,
    videoId: string,
    title: string,
    answers: string[],
}
type MusicCSVEntry = {
    team: string,
    video: string,
    title: string,
    ko_translate: string,
    ko_read: string,
    en_read: string,
    sub1: string,
    sub2: string,
    sub3: string,
}

/*
const keyMap = new Map<string, number>();

export function TeamNameToIndex(name: MusicTeam): number {
    if (!keyMap.has(name)) {
        keyMap.set(name, TeamList.indexOf(name));
    }
    return keyMap.get(name)!;
}
*/

export class MusicManager {
    private static PresetLibrary = new MusicLibrary();
    private static UserLibrary = new MusicLibrary();
    public static CurrentLibrary: MusicLibrary;
    public static MusicList: MusicObject[] = [];

    public static parseCSV(results: any, useCustom: boolean, onException: any = () => {
    }, onSuccess: any = () => {
    }) {
        const rows = results.data as MusicCSVEntry[]; // array of objects
        const library = new MusicLibrary();
        library.clear();
        let line = 0;
        try {
            rows.forEach((item: MusicCSVEntry) => {
                    const obj: MusicObject = {
                        team: item.team,
                        videoId: InputManager.cleanseVid(item.video),
                        title: item.title,
                        answers: []
                    };
                    const answers = [item.ko_translate, item.ko_read, item.en_read, item.sub1, item.sub2, item.sub3];
                    obj.answers = answers.filter((ans) => ans.length > 0);
                    library.put(obj);
                    line++;
                }
            );
        } catch (e) {
            onException(`${line}줄 부근, `);
            return;
        }
        if (useCustom) {
            this.UserLibrary = library;
        } else {
            this.PresetLibrary = library;
        }
        onSuccess();
    }

    public static async loadPreset() {
        const response = await fetch('/mlist.csv')!;
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        this.parseCSV(results, false);
        this.selectLibrary(false);
        this.buildRandomList();
    };

    public static selectLibrary(useCustom: boolean) {
        this.CurrentLibrary = useCustom ? this.UserLibrary : this.PresetLibrary;
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
