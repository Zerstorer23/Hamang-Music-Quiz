import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {randomInt} from "system/Constants/GameConstants";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";

export class MusicManager {

    static iterator = 0;
    static MusicList: string[] = [
        "uaLGwqCksrI",
        "j4ZuoUOkjSY",
        "P9V10ZmUBIA",
        "AYUNaQaDfa8",
    ];

    public static resetIterator() {
        this.iterator = 0;
    }

    public static pollRandom(): MusicEntry | null {
        this.iterator++;
        if (this.iterator >= this.MusicList.length) {
            return null;
        }
        return {
            c: this.iterator,
            vid: this.MusicList[this.iterator],
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
