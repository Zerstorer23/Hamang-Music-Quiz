const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);

export class InputManager {
    public static cleanseNumber(event: any, min: number, defaultVal: number): number | null {
        let numVal: number = +event.target.value;
        if (isNaN(numVal)) {
            event.target.value = defaultVal;
            return null;
        }
        console.log("guess time");
        if (numVal < min) numVal = 5;
        return numVal;
    }

    public static cleanseAnswer(answer: string): string {
        answer = answer.replaceAll(LF, "");
        answer = answer.replaceAll(CR, "");
        answer = answer.replaceAll(" ", "");
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
}