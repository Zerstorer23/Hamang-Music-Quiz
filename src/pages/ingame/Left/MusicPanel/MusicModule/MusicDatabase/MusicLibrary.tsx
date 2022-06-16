import {MusicObject} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import {shuffleArray} from "system/Constants/GameConstants";

export type MusicFilter = Map<string, boolean>;

export class MusicLibrary {
    public headers: MusicFilter = new Map<string, boolean>();
    public library = new Map<string, MusicObject>();

    public clear() {
        this.headers.clear();
        this.library.clear();
    }

    public put(obj: MusicObject) {
        this.library.set(obj.videoId, obj);
        this.headers.set(obj.team, true);
    }

    public get(vid: string): MusicObject | null {
        if (!this.library.has(vid)) return null;
        return this.library.get(vid)!;
    }

    public applyFilter(): MusicObject[] {
        let list: MusicObject[] = [];
        this.library.forEach((value, key, map) => {
            if (!this.headers.has(value.team) || !this.headers.get(value.team)) return;
            list.push(value);
        });
        list = shuffleArray(list);
        return list;
    }

    public updateHeader(filters: MusicFilter): boolean {
        let numTrue = 0;
        filters.forEach((use, name, array) => {
            if (use) numTrue++;
        });
        if (numTrue === 0) return false;
        this.headers = filters;
        return true;
    }


    public printHeaders(): string {
        let announce = "";
        this.headers.forEach((use, name, array) => {
            if (use) {
                announce += name + ",";
            }
        });
        return announce;
    }
}