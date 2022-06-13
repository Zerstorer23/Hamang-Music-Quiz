
export type Player = {
    isSpectating: boolean; //may not need it
    isReady: boolean;
    gameWins:number;
    wins: number;
    name: string;
};
export type PlayerEntry = {
    id: string;
    isSpectating: boolean; //may not need it
    isReady: boolean;
    gameWins:number;
    wins: number;
    name: string;
};

export type RoomSettings = {
    included:boolean[]
}
export type RoomHeader = {
    seed: number;
    hostId: string;
    games: number;
    settings: RoomSettings;
};
export type MusicEntry = {
    c: number;
    vid: string;
    status:MusicStatus;
};

export enum MusicStatus{
    Playing,Revealing
}
export enum GameStatus{
    Lobby,InGame,Over,
}
export type Game={
    music:MusicEntry;
    status:GameStatus;
}
export type PlayerMap = Map<string, Player>;
export type Room = {
    playerMap: PlayerMap;
    playerList: string[];
    game:Game;
    header: RoomHeader;
};