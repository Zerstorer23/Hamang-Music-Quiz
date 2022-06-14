import {Fragment, useContext, useEffect, useState} from "react";
import RoomContext, {UpdateType} from "system/context/roomInfo/room-context";
import {
    IProps,
    LISTEN_CHILD_ADDED,
    LISTEN_CHILD_CHANGED,
    LISTEN_CHILD_REMOVED,
    LISTEN_VALUE,
    LoadStatus,
    Snapshot,
} from "system/types/CommonTypes";
import ChatLoader from "pages/components/ui/ChatModule/ChatLoader";
import {cleanChats} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {ReferenceManager} from "system/Database/ReferenceManager";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {Listeners, ListenerTypes} from "system/context/roomInfo/RoomContextProvider";
import {Player, Room, RoomHeader} from "system/types/GameTypes";
import {RoomDatabase} from "system/Database/RoomDatabase";
import {PlayerManager} from "system/Database/PlayerManager";

function checkNull<T>(snapshot: Snapshot): [boolean, T] {
    const data: T = snapshot.val();
    return [data !== null, data];
}

export default function DataLoader(props: IProps) {
    const [isLoaded, setStatus] = useState(LoadStatus.init);
    const context = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    ///====LOAD AND LISTEN DB===///
    //https://firebase.google.com/docs/reference/node/firebase.database.Reference#on
    function updateField<T>(listenerType: ListenerTypes, snapshot: Snapshot) {
        const [valid, data] = checkNull<T>(snapshot);
        if (!valid) return;
        context.onUpdateField(listenerType, data);
    }

    function onUpdatePlayer(snapshot: Snapshot) {
        const [valid, player] = checkNull<Player>(snapshot);
        if (!valid) return;
        context.onUpdatePlayer(PlayerManager.createEntry(snapshot.key!, player), UpdateType.Update);
    }

    function onAddPlayer(snapshot: Snapshot) {
        const [valid, player] = checkNull<Player>(snapshot);
        if (!valid) return;
        context.onUpdatePlayer(PlayerManager.createEntry(snapshot.key!, player), UpdateType.Insert);
    }

    function onRemovePlayer(snapshot: Snapshot) {
        const [valid, player] = checkNull<Player>(snapshot);
        if (!valid) return;
        context.onUpdatePlayer(PlayerManager.createEntry(snapshot.key!, player), UpdateType.Delete);
    }

    function onUpdateGame(snapshot: Snapshot) {
        updateField<string>(ListenerTypes.Game, snapshot);
    }

    function onUpdateHeader(snapshot: Snapshot) {
        updateField<RoomHeader>(ListenerTypes.Header, snapshot);
    }

    function setListeners(listeners: Listeners) {
        const playerListRef = listeners.get(ListenerTypes.PlayerList)!;
        playerListRef.on(LISTEN_CHILD_CHANGED, onUpdatePlayer);
        playerListRef.on(LISTEN_CHILD_ADDED, onAddPlayer);
        playerListRef.on(LISTEN_CHILD_REMOVED, onRemovePlayer);
        //Add game listener
        listeners.get(ListenerTypes.Game)!.on(LISTEN_VALUE, onUpdateGame);
        listeners.get(ListenerTypes.Header)!.on(LISTEN_VALUE, onUpdateHeader);
    }

    ///////////////END LISTENER--////////////////////////
    function onDisconnectCleanUp(id: string) {
        localCtx.setVal(LocalField.Id, id);
        const myRef = ReferenceManager.getPlayerReference(id);
        myRef.onDisconnect().remove();
    }

    async function setUpRoom() {
        const myId = await RoomDatabase.initialiseRoom();
        onDisconnectCleanUp(myId);
    }

    async function playerJoin() {
        const myId = await RoomDatabase.joinLobby();
        onDisconnectCleanUp(myId);
    }

    function joinPlayer() {
        if (context.room.playerMap.size === 0) {
            //Join as host
            console.log("Join as host");
            setUpRoom();
        } else {
            console.log("Join as client");
            playerJoin();
        }
    }


    useEffect(() => {
        switch (isLoaded) {
            case LoadStatus.init:
                RoomDatabase.loadRoom().then((room: Room) => {
                    context.onRoomLoaded(room);
                    setStatus(LoadStatus.loaded);
                });
                break;
            case LoadStatus.loaded:
                const listeners = RoomDatabase.registerListeners();
                setListeners(listeners);
                setStatus(LoadStatus.listening);
                break;
            case LoadStatus.listening:
                joinPlayer();
                setStatus(LoadStatus.joined);
                break;
            case LoadStatus.joined:
                console.log("Joined");
                //Wait for my id to be set
                break;
            case LoadStatus.outerSpace:
                break;
        }
    }, [isLoaded]);
    const myId = localCtx.getVal(LocalField.Id);
    useEffect(() => {
        if (myId === null) return;
        setStatus(LoadStatus.outerSpace);
    }, [myId]);
    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
}
