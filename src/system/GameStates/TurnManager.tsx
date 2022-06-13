
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {PlayerEntry, PlayerMap} from "system/types/GameTypes";
import {LocalContextType, LocalField} from "system/context/localInfo/LocalContextProvider";



export class TurnManager {
    /**
     *
     * @returns  use room hash to get first player
     */
    public static getFirstTurn(seed: number, playerSize: number): number {
        return seed % playerSize;
    }

    /**
     *
     * @returns Get next safe turn
     */
    public static getNextTurn(playerMap: PlayerMap, playerList: string[], turn: number, startWithIncrement = true): number {
        let newTurn = (startWithIncrement) ? turn + 1 : turn;
        newTurn %= playerList.length;
        let currPlayer = playerMap.get(playerList[newTurn]);
        while (currPlayer?.isSpectating) {
            newTurn = (newTurn + 1) % playerList.length;
            currPlayer = playerMap.get(playerList[newTurn]);
        }
        return newTurn;
    }

    public static amHost(ctx: RoomContextType, localCtx: LocalContextType) {
        const myId = localCtx.getVal(LocalField.Id);
        return ctx.room.header.hostId === myId;
    }
    public static getMyInfo(
        ctx: RoomContextType,
        localCtx: LocalContextType
    ): PlayerEntry {
        return this.getPlayerInfoById(ctx, localCtx.getVal(LocalField.Id));
    }

    public static getPlayerInfoById(ctx: RoomContextType, playerId: string): PlayerEntry {
        const player = ctx.room.playerMap.get(playerId)!;
        return {id: playerId, ...player};
    }

}
