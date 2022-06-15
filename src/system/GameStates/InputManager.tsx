import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";

const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

export class InputManager {
    public static cleanseTime(event: any, min: number, defaultVal: number): number | null {
        let numVal: number = +event.target.value;
        if (isNaN(numVal)) {
            event.target.value = defaultVal;
            return null;
        }
        if (numVal < min) {
            numVal = min;
        }
        return numVal;
    }

    public static cleanseSongs(event: any): number | null {
        let numVal: number = +event.target.value;
        if (isNaN(numVal)) {
            event.target.value = Math.min(5, MusicManager.MusicList.length);
            return null;
        }
        return Math.min(numVal, MusicManager.MusicList.length);
    }

    public static isNumber(ref: any, def: number): number {
        let numVal: number = +ref.value;
        if (isNaN(numVal)) {
            ref.value = def;
            return -1;
        }
        return numVal;
    }

    public static cleanseAnswer(answer: string): string {
        answer = answer.replaceAll(LF, "")
            .replaceAll(CR, "")
            .replaceAll(" ", "")
            .replace(reg, "")
            .toLowerCase();
        if (answer.length > 128) {
            answer = answer.substring(0, 128);
        }
        return answer;
    }

    public static cleanseChat(answer: string): string {
        answer = answer.replaceAll(LF, "");
        answer = answer.replaceAll(CR, "");
        if (answer.length > 128) {
            answer = answer.substring(0, 128);
        }
        return answer;
    }

    public static cleanseVid(url: string) {

        if (url.length === 11) {
            return url;
        } else if (url.includes("youtu.be")) {
            //share url
            let temp = url.lastIndexOf("/");
            return url.substring(temp + 1, temp + 12);
        } else {
            let temp = url.indexOf("v=");
            return url.substring(temp + 2, temp + 13);
        }

    }
}