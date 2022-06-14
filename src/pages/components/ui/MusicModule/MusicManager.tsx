import {MusicEntry, MusicStatus} from "system/types/GameTypes";
import {randomInt} from "system/Constants/GameConstants";

export class MusicManager {

    static MusicList: string[] = [
        "uaLGwqCksrI",
        "j4ZuoUOkjSY",
        "P9V10ZmUBIA",
        "AYUNaQaDfa8",
    ];

    public static testPollRandom(): MusicEntry {
        return {
            c: 0,
            vid: this.MusicList[randomInt(0, this.MusicList.length - 1)],
            status: MusicStatus.Playing,
        };
    }

}
