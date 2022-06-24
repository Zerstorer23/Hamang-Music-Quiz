export enum StorageKeys {
    lastChannel = "lastChannel"
}

export class LocalStorage {

    public static getVal(key: StorageKeys, defVal: any): string {
        const v = localStorage.getItem(key);
        if (v === null || v === undefined) {
            this.setVal(key, defVal);
            return defVal;
        }
        return v;
    }

    public static setVal(key: StorageKeys, v: any) {
        localStorage.setItem(key, v);
    }
}
