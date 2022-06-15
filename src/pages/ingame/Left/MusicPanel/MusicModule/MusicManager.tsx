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
    private static MusicLibrary = new Map<string, MusicObject>();
    public static MusicList: MusicObject[] = [];

    public static async loadFile() {
        const response = await fetch('/mlist.csv')!;
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        const rows = results.data as MusicCSVEntry[]; // array of objects
        this.MusicLibrary.clear();
        rows.forEach((item: MusicCSVEntry) => {
                const obj: MusicObject = {
                    team: item.team,
                    videoId: InputManager.cleanseVid(item.video),
                    title: item.title,
                    answers: []
                };
                if (item.ko_translate.length > 0) obj.answers.push(item.ko_translate);
                if (item.ko_read.length > 0) obj.answers.push(item.ko_read);
                if (item.en_read.length > 0) obj.answers.push(item.en_read);
                this.MusicLibrary.set(obj.videoId, obj);
            }
        );
        this.buildRandomList(RoomManager.getDefaultIncluded());
    };

    public static buildRandomList(filters: boolean[]): number {
        this.MusicList = [];
        this.MusicLibrary.forEach((value, key, map) => {
            const index = TeamNameToIndex(value.team);
            if (!filters[index]) return;
            this.MusicList.push(value);
        });
        this.MusicList = shuffleArray(this.MusicList);
        return this.MusicList.length;
    }

    public static getMusic(vid: string): MusicObject | null {
        if (!this.MusicLibrary.has(vid)) return null;
        return this.MusicLibrary.get(vid)!;
    }

    //TODO Everyone builds their own randomised list
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
        const music = this.MusicLibrary.get(vid);
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
