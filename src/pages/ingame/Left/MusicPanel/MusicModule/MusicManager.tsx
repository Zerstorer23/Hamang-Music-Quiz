import {MusicEntry, MusicStatus, PlayerEntry} from "system/types/GameTypes";
import {randomInt} from "system/Constants/GameConstants";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";

export class MusicManager {
    static MusicList: string[] = [
        "uaLGwqCksrI",
        "j4ZuoUOkjSY",
        "P9V10ZmUBIA",
        "AYUNaQaDfa8",
    ];


    public static pollNext(counter: number): MusicEntry | null {
        if (counter >= this.MusicList.length) return null;
        return {
            counter: counter,
            vid: this.MusicList[counter],
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
