import {MusicObject} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import {PlayAt, PlaySpeed} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";

export type Player = {
    isSpectating: boolean; //may not need it
    isReady: boolean;
    totalWin: number;
    wins: number;
    name: string;
    answer: string;
};
export type PlayerEntry = {
    id: string,
    player: Player
};

export type RoomSettings = {
    guessTime: number,
    songsPlay: number,
    limitedCommunication: boolean,
    playAt: PlayAt,
    speed: PlaySpeed,
    useArtists: boolean,
    blocker: boolean,
}
export type RoomHeader = {
    seed: number;
    hostId: string;
    games: number;
    settings: RoomSettings;
};
export type MusicEntry = {
    counter: number;
    music: MusicObject;
    seed: number;
    status: MusicStatus;
};

export enum MusicStatus {
    WaitingMusic,
    Playing,
    ReceivingAnswers,
    Revealing,
}

export enum GameStatus {
    Lobby, InGame, Over,
}

export type Game = {
    musicEntry: MusicEntry;
    gameStatus: GameStatus;
}
export type PlayerMap = Map<string, Player>;
export type Room = {
    playerMap: PlayerMap;
    playerList: string[];
    game: Game;
    header: RoomHeader;
};