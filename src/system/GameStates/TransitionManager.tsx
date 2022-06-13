
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Game, GameStatus} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";


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
        const state: Game = {
            music: RoomManager.getDefaultMusic(),
            status: GameStatus.Lobby
        };
        ReferenceManager.atomicDelta(DbFields.HEADER_games, -1);
        ReferenceManager.updateReference(DbFields.GAME, state);
    }

}
