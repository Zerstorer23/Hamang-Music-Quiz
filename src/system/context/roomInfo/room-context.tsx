import React from "react";
import {ListenerTypes, RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {PlayerEntry, Room} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";

export enum UpdateType {
    Insert = "insert",
    Delete = "delete",
    Update = "update",
}

const RoomContext = React.createContext<RoomContextType>({
    room: RoomManager.getDefaultRoom(),
    onRoomLoaded: (snapshot: Room) => {
    },
    onUpdatePlayer: (playerEntry: PlayerEntry, utype: UpdateType) => {
    },
    onUpdateField: (field: ListenerTypes, data: any) => {
    },
});
export default RoomContext;
