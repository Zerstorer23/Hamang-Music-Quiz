import {useReducer} from "react";
import RoomContext, {UpdateType,} from "system/context/roomInfo/room-context";
import {DbRef, IProps} from "system/types/CommonTypes";
import {Player, PlayerEntry, Room} from "system/types/GameTypes";
import {RoomDatabase} from "system/Database/RoomDatabase";
import {PlayerManager} from "system/Database/PlayerManager";
import {RoomManager} from "system/Database/RoomManager";

/* Room Context
Holds data 1 to 1 match to DB.
DataLoader loads Data into local, this broadcasts that data to all other components
Use ReferenceManager to uploadData
*/
export type RoomContextType = {
    room: Room;
    onRoomLoaded: (snapshot: Room) => void;
    onUpdatePlayer: (playerEntry: PlayerEntry, utype: UpdateType) => void;
    onUpdateField: (field: ListenerTypes, data: any) => void;
};

export enum ListenerTypes {
    Game,
    PlayerList,
    Header,
}

export type Listeners = Map<ListenerTypes, DbRef>;

enum RoomContextAction {
    RoomLoaded,
    PlayerUpdated,
    FieldUpdated,
}

type RoomActionType = {
    id?: string;
    type: RoomContextAction;
    room?: Room;
    mainParam?: any;
    sideParam?: any;
};

function handlePlayerUpdate(newRoom: Room, action: RoomActionType) {
    const updateType = action.sideParam;
    const entry = action.mainParam as PlayerEntry;
    switch (updateType) {
        case UpdateType.Update:
        case UpdateType.Insert:
            newRoom.playerMap.set(entry.id, entry.player);
            newRoom.playerList = PlayerManager.getSortedListFromMap(newRoom.playerMap);
            break;
        case UpdateType.Delete:
            newRoom.playerMap.delete(entry.id);
            newRoom.playerList = PlayerManager.getSortedListFromMap(newRoom.playerMap);
            if (entry.id === newRoom.header.hostId || !newRoom.playerMap.has(newRoom.header.hostId)) {
                newRoom.header.hostId = newRoom.playerList[0];
                console.warn("Detected host disconnect " + newRoom.header.hostId);
            }
            break;
    }
}


function handleFieldUpdate(newRoom: Room, action: RoomActionType) {
    const fieldType: ListenerTypes = action.mainParam;
    switch (fieldType) {
        case ListenerTypes.Game:
            newRoom.game = action.sideParam;
            break;
        case ListenerTypes.PlayerList:
            newRoom.playerMap = action.sideParam;
            break;
        case ListenerTypes.Header:
            newRoom.header = action.sideParam;
            break;
    }
}

function roomReducer(prevRoom: Room, action: RoomActionType): Room {
    let newRoom: Room = {...prevRoom,};
    switch (action.type) {
        case RoomContextAction.RoomLoaded:
            newRoom = action.room!;
            newRoom.playerList = PlayerManager.getSortedListFromMap(newRoom.playerMap);
            break;
        case RoomContextAction.PlayerUpdated:
            handlePlayerUpdate(newRoom, action);
            break;
        case RoomContextAction.FieldUpdated:
            handleFieldUpdate(newRoom, action);
            break;
        default:
            return RoomManager.getDefaultRoom();
    }
    return newRoom;
}

export default function RoomProvider(props: IProps) {
    const [roomState, dispatchRoomState] = useReducer(roomReducer, RoomManager.getDefaultRoom());


    function onRoomLoaded(snapshot: Room) {
        const param = {
            type: RoomContextAction.RoomLoaded,
            room: snapshot,
        };
        dispatchRoomState(param);
    }

    function onUpdatePlayer(entry: PlayerEntry, utype: UpdateType) {
        const param: RoomActionType = {
            type: RoomContextAction.PlayerUpdated,
            mainParam: entry,
            sideParam: utype,
        };
        dispatchRoomState(param);
    }

    function onUpdateField(field: ListenerTypes, data: any) {
        const param: RoomActionType = {
            type: RoomContextAction.FieldUpdated,
            mainParam: field,
            sideParam: data,
        };
        dispatchRoomState(param);
    }

    const roomContext: RoomContextType = {
        room: roomState,
        onRoomLoaded,
        onUpdatePlayer,
        onUpdateField,
    };
    return (
        <RoomContext.Provider value={roomContext}>
            {props.children}
        </RoomContext.Provider>
    );
}
