
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Player, PlayerEntry, PlayerMap} from "system/types/GameTypes";
import {randomInt} from "system/Constants/GameConstants";
import {PlayerIdPair} from "system/context/roomInfo/RoomContextProvider";

export class PlayerManager {


    public static getDefaultName(): string {
        return `ㅇㅇ (${randomInt(1, 255)}.${randomInt(1, 255)})`;
    }

    public static getDefaultPlayer() {
        const newPlayer: Player = {
            isSpectating: false,
            isReady: false,
            wins: 0,
            name:  this.getDefaultName(),
            gameWins:0,
        };
        return newPlayer;
    }


    public static async joinLocalPlayer(asHost: boolean): Promise<string> {
        const playersRef = ReferenceManager.getRef(DbFields.PLAYERS);
        const player = this.getDefaultPlayer();

        const myRef = playersRef.push();
        await myRef.set(player);
        const myId = await myRef.key;
        if (asHost) {
            ReferenceManager.updateReference(DbFields.HEADER_hostId, myId);
        }
        // fetchFishServer(player.name);
        return myId!;
    }

    /**
     *
     * @param map
     * @returns Sorted list that is used for determining turns
     */


    public static getSortedListFromMap(map: PlayerMap): string[] {
        const arr: string[] = [];
        map.forEach((_player, id) => {
            arr.push(id);
        });
        return arr.sort((e1: string, e2: string) =>
            e1 > e2 ? 1 : e1 < e2 ? -1 : 0
        );
    }

    static createEntry(id:string, player:Player):PlayerEntry {
        return {id,...player};
    }
    public static createDBEntry(id:string, player:Player):PlayerIdPair {
        return {id,player};
    }
}
