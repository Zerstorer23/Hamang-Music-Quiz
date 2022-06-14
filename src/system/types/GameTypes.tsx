export type Player = {
    isSpectating: boolean; //may not need it
    isReady: boolean;
    gameWins: number;
    wins: number;
    name: string;
    answer: string;
};
export type PlayerEntry = {
    id: string,
    player: Player
};

export type RoomSettings = {
    included: boolean[],
    guessTime: number,
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
    status: MusicStatus;
};

export enum MusicStatus {
    WaitingMusic,
    //  Injecting,
    Playing,
    Revealing,
}

export enum GameStatus {
    Lobby, InGame, Over,
}

export type Game = {
    music: MusicEntry;
    status: GameStatus;
}
export type PlayerMap = Map<string, Player>;
export type Room = {
    playerMap: PlayerMap;
    playerList: string[];
    game: Game;
    header: RoomHeader;
};