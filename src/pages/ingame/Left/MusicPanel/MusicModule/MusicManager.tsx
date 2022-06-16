import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import Papa from "papaparse";
import {MusicFilter, MusicLibrary} from "pages/ingame/Left/MusicPanel/MusicModule/MusicLibrary";
import {GameConfigs} from "system/configs/GameConfigs";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";

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

export enum PresetName {
    Suzumiya = "suzumiya",
    Idol765 = "i765",
    User = "user",
}

export function presetToName(preset: PresetName) {
    switch (preset) {
        case PresetName.Suzumiya:
            return "스즈미야";
        case PresetName.Idol765:
            return "아이마스";
        case PresetName.User:
            return "사용자지정";

    }
}

export class MusicManager {
    public static presetsList = [PresetName.Suzumiya, PresetName.Idol765];
    private static PresetLibrary = new Map<PresetName, MusicLibrary>();
    public static CurrentLibrary: MusicLibrary;
    public static MusicList: MusicObject[] = [];

    public static parseCSV(results: any, presetName: PresetName, onException: any = () => {
    }, onSuccess: any = () => {
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
                    const obj: MusicObject = {
                        team: item.team,
                        videoId: InputManager.cleanseVid(item.video),
                        title: item.title,
                        answers: []
                    };
                    const answers = [item.ko_translate, item.ko_read, item.en_read, item.sub1, item.sub2, item.sub3];
                    obj.answers = answers.filter((ans) => {
                        if (ans === undefined) return false;
                        return ans.length > 0;
                    });
                    library.put(obj);
                    line++;
                }
            );
        } catch (e: any) {
            console.warn(e.stack);
            onException(`${line}줄 부근:${JSON.stringify(lastItem)} `);
            return;
        }
        this.PresetLibrary.set(presetName, library);
        onSuccess();
    }

    public static async loadPreset(presetName: PresetName) {
        const response = await fetch(`presets/${presetName}.csv`)!;
        const reader = response.body!.getReader();
        const result = await reader.read(); // raw array
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value); // the csv text
        const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
        this.parseCSV(results, presetName, (a: any) => {
            console.warn(presetName + ": " + a);
        });
        this.selectLibrary(presetName);
        sendAnnounce(`${presetToName(presetName)}가 다시 로드됨 (${this.CurrentLibrary.library.size}개 찾음)`);
    };

    public static async loadPresets() {
        for (const preset of this.presetsList) {
            const response = await fetch(`presets/${preset}.csv`)!;
            const reader = response.body!.getReader();
            const result = await reader.read(); // raw array
            const decoder = new TextDecoder('utf-8');
            const csv = decoder.decode(result.value); // the csv text
            const results = Papa.parse(csv, {header: true}); // object with { data, errors, meta }
            this.parseCSV(results, preset, (a: any) => {
                console.warn(preset + ": " + a);
            });
        }
        this.selectLibrary(GameConfigs.defaultPreset);
    };

    public static selectLibrary(presetName: PresetName) {
        this.CurrentLibrary = this.PresetLibrary.get(presetName)!;
        this.buildRandomList();
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
