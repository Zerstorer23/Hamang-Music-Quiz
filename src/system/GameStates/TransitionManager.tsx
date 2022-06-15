import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Game, GameStatus, MusicStatus} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";


export enum TransitionAction {
    Success,
    Abort,
    EndTurn,
}

export default class TransitionManager {


    public static pushEndGame() {
        ReferenceManager.updateReference(DbFields.GAME_status, GameStatus.Over);
    }

    public static pushLobby() {
        const game: Game = {
            musicEntry: RoomManager.getDefaultMusic(),
            gameStatus: GameStatus.Lobby
        };
        ReferenceManager.atomicDelta(DbFields.HEADER_games, -1);
        ReferenceManager.updateReference(DbFields.GAME, game);
    }

    public static pushMusicState(state: MusicStatus) {
        ReferenceManager.updateReference(DbFields.GAME_musicEntry_status, state);
    }
}
