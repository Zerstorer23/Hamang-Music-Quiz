import {DbRef,} from "system/types/CommonTypes";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Player, PlayerMap, Room} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {PlayerManager} from "system/Database/PlayerManager";
import {Listeners, ListenerTypes} from "system/context/roomInfo/RoomContextProvider";

export class RoomDatabase {

    public static async initialiseRoom() {
        const roomRef = ReferenceManager.getRef(DbFields.ROOM);
        const defaultRoom = RoomManager.getDefaultRoom();
        await roomRef.set(defaultRoom);
        ReferenceManager.getRef(DbFields.ROOT).onDisconnect().remove();
        return await PlayerManager.joinLocalPlayer(true);
    }

    public static async joinLobby(): Promise<string> {
        return await PlayerManager.joinLocalPlayer(false);
    }

    public static async loadRoom(): Promise<Room> {
        const roomRef = ReferenceManager.getRef(DbFields.ROOM);
        const snapshot = await roomRef.get();
        if (!snapshot.exists()) {
            return RoomManager.getDefaultRoom();
        } else {
            const room: Room = snapshot.val();
            if (room["playerMap"] === undefined) {
                room.playerMap = new Map<string, Player>();
            }
            room.playerMap = this.parsePlayerMap(room.playerMap);
            room.playerList = PlayerManager.getSortedListFromMap(room.playerMap);
            return room;
        }
    }


    static parsePlayerMap(roomMap: PlayerMap): PlayerMap {
        const playerMap = new Map<string, Player>();
        if (roomMap === undefined) return playerMap;
        Object.entries(roomMap).forEach(([key, value]) => {
            playerMap.set(key, value);
        });
        return playerMap;
    }


    public static registerListeners(): Listeners {
        const listeners = new Map<ListenerTypes, DbRef>();
        listeners.set(ListenerTypes.Game, ReferenceManager.getRef(DbFields.GAME));
        const headerRef = ReferenceManager.getRef(DbFields.HEADER);
        listeners.set(ListenerTypes.Header, headerRef);
        const playersRef = ReferenceManager.getRef(DbFields.PLAYERS);
        listeners.set(ListenerTypes.PlayerList, playersRef);
        return listeners;
    }
}
