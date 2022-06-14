import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Player, PlayerEntry, PlayerMap} from "system/types/GameTypes";
import {randomInt} from "system/Constants/GameConstants";

export class PlayerManager {


    public static getDefaultName(): string {
        return `ㅇㅇ (${randomInt(1, 255)}.${randomInt(1, 255)})`;
    }

    public static getDefaultPlayer() {
        const newPlayer: Player = {
            isSpectating: false,
            isReady: false,
            wins: 0,
            name: this.getDefaultName(),
            gameWins: 0,
            answer: "",
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

    public static sortByWins(map: PlayerMap, list: string[]): PlayerEntry[] {

        const arr = list.map((id) => (PlayerManager.createEntry(id, map.get(id)!)));
        return arr.sort((e1: PlayerEntry, e2: PlayerEntry) =>
            e1.player.wins > e2.player.wins ? 1 : e1.player.wins < e2.player.wins ? -1 : 0
        );
    }

    static createEntry(id: string, player: Player): PlayerEntry {
        return {id, player};
    }

}
