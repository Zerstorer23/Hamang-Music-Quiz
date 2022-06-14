const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);

export class InputManager {

    public static cleanseAnswer(answer: string): string {
        answer = answer.replaceAll(LF, "");
        answer = answer.replaceAll(CR, "");
        answer = answer.replaceAll(" ", "");
        if (answer.length > 128) {
            answer = answer.substring(0, 128);
        }
        return answer;
    }
}