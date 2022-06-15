import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {PlayerEntry, PlayerMap} from "system/types/GameTypes";
import {LocalContextType, LocalField} from "system/context/localInfo/LocalContextProvider";


export class TurnManager {

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

    public static getPlayerInfoById(ctx: RoomContextType, id: string): PlayerEntry {
        const player = ctx.room.playerMap.get(id)!;
        return {id, player};
    }

    public static getRemainingSongs(ctx: RoomContextType): number {
        return ctx.room.header.settings.songsPlay - ctx.room.game.musicEntry.counter - 1;
    }
}
