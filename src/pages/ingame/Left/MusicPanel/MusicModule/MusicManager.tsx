import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import Papa from "papaparse";
import {shuffleArray} from "system/Constants/GameConstants";

//https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit#gid=0

export enum MusicTeam {
    Haruhi,
    Kon,
    LuckyStar
}

type CSVTeamName = "하루히" | "케이온" | "러키스타";

export type MusicObject = {
    team: MusicTeam,
    videoId: string,
    title: string,
    answers: string[],
}
type MusicCSVEntry = {
    team: CSVTeamName,
    video: string,
    title: string,
    ko_translate: string,
    ko_read: string,
    en_read: string,
}


export class MusicManager {
    private static MusicLibrary = new Map<string, MusicObject>();
    public static MusicList: MusicObject[] = [];

    public static async loadFile() {
        const response = await fetch('/mlist.csv')!;
        console.log(response);
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        const rows = results.data as MusicCSVEntry[]; // array of objects
        this.MusicLibrary.clear();
        rows.forEach((item: MusicCSVEntry) => {
                const obj: MusicObject = {
                    team: this.TeamNameToIndex(item.team),
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
        console.log(this.MusicList);
    };

    public static buildRandomList(filters: boolean[], count: number): number {
        this.MusicList = [];
        let allList: MusicObject[] = [];
        this.MusicLibrary.forEach((value, key, map) => {
            if (!filters[value.team as number]) return;
            allList.push(value);
        });
        allList = shuffleArray(allList);
        this.MusicList = allList.slice(0, Math.min(count, allList.length));
        return this.MusicList.length;
    }

    private static TeamNameToIndex(name: CSVTeamName): MusicTeam {
        switch (name) {
            case "하루히":
                return MusicTeam.Haruhi;
            case "케이온":
                return MusicTeam.Haruhi;
            case "러키스타":
                return MusicTeam.Kon;
            default:
                return MusicTeam.Haruhi;
        }
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

    public static checkAnswer(vid: string, answer: string): boolean {
        answer = InputManager.cleanseAnswer(answer);
        if (answer.length <= 0) return false;
        console.log("Check " + answer);
        return true;
    }

    public static addPoints(player: PlayerEntry) {
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_wins, 1);
        ReferenceManager.atomicDeltaByPlayerField(player.id, PlayerDbFields.PLAYER_gameWins, 1);
    }
}
