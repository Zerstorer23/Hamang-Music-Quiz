import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import Papa from "papaparse";
import {shuffleArray} from "system/Constants/GameConstants";
import {RoomManager} from "system/Database/RoomManager";

//https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit#gid=0

export enum MusicTeam {
    Haruhi = "하루히",
    Kon = "케이온",
    LuckyStar = "러키스타",
    KyoAni = "쿄애니",
    Vocaloid = "보컬로이드",
    Idols = "아이돌",
    Etc = "기타",
}

export const TeamList: MusicTeam[] = [
    MusicTeam.Haruhi,
    MusicTeam.Kon,
    MusicTeam.LuckyStar,
    MusicTeam.KyoAni,
    MusicTeam.Vocaloid,
    MusicTeam.Idols,
    MusicTeam.Etc,
];
export type MusicObject = {
    team: MusicTeam,
    videoId: string,
    title: string,
    answers: string[],
}
type MusicCSVEntry = {
    team: MusicTeam,
    video: string,
    title: string,
    ko_translate: string,
    ko_read: string,
    en_read: string,
}
const keyMap = new Map<string, number>();

export function TeamNameToIndex(name: MusicTeam): number {
    if (!keyMap.has(name)) {
        keyMap.set(name, TeamList.indexOf(name));
    }
    return keyMap.get(name)!;
}

export class MusicManager {
    private static PresetLibrary = new Map<string, MusicObject>();
    private static CustomLibrary = new Map<string, MusicObject>();
    public static CurrentLibrary: Map<string, MusicObject>;
    public static MusicList: MusicObject[] = [];

    public static parseCSV(results: any, useCustom: boolean, onException: any = () => {
    }) {
        const rows = results.data as MusicCSVEntry[]; // array of objects
        const library = useCustom ? this.CustomLibrary : this.PresetLibrary;
        library.clear();
        rows.forEach((item: MusicCSVEntry) => {
                try {
                    const obj: MusicObject = {
                        team: item.team,
                        videoId: InputManager.cleanseVid(item.video),
                        title: item.title,
                        answers: []
                    };
                    if (item.ko_translate.length > 0) obj.answers.push(item.ko_translate);
                    if (item.ko_read.length > 0) obj.answers.push(item.ko_read);
                    if (item.en_read.length > 0) obj.answers.push(item.en_read);

                    library.set(obj.videoId, obj);
                } catch (e) {
                    onException(item);
                }
            }
        );
        console.log(rows);
    }

    public static async loadPreset() {
        const response = await fetch('/mlist.csv')!;
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        this.parseCSV(results, false);
        this.buildRandomList(RoomManager.getDefaultIncluded(), false);
    };

    public static buildRandomList(filters: boolean[], useCustom: boolean): number {
        this.MusicList = [];
        this.CurrentLibrary = useCustom ? this.CustomLibrary : this.PresetLibrary;
        this.CurrentLibrary.forEach((value, key, map) => {
            const index = TeamNameToIndex(value.team);
            if (!filters[index]) return;
            this.MusicList.push(value);
        });
        this.MusicList = shuffleArray(this.MusicList);
        return this.MusicList.length;
    }

    public static getMusic(vid: string): MusicObject | null {
        if (!this.CurrentLibrary.has(vid)) return null;
        return this.CurrentLibrary.get(vid)!;
    }

    public static pollNext(counter: number): MusicEntry | null {
        if (counter >= this.MusicList.length) return null;
        return {
            counter: counter,
            vid: this.MusicList[counter].videoId,
            status: MusicStatus.Playing,
        };
    }

    public static checkAnswer(vid: string, myAnswer: string): boolean {
        myAnswer = InputManager.cleanseAnswer(myAnswer);
        if (myAnswer.length <= 0) return false;
        const music = this.CurrentLibrary.get(vid);
        if (music === undefined) return false;
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
