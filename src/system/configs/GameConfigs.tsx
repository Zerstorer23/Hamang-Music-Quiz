import {PresetName} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/Presets";

export class GameConfigs {
    public static defaultGames = 8;//한세션 최대 게임 수
    public static addGames = 5; //추가 게임 수
    public static defaultGuessTime = 20; //초기 정답시간 
    public static defaultSongNumber = 20; //초기 음악 수
    public static chatsInTenSec = 10;
    public static defaultPreset = PresetName.Base;
}