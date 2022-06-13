import HorizontalLayout from "../components/ui/HorizontalLayout";
import VerticalLayout from "../components/ui/VerticalLayout";
import classes from "./InGame.module.css";
import {Fragment, useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import gc from "global.module.css";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {DS} from "system/configs/DS";
import TransitionManager from "system/GameStates/TransitionManager";
import {Navigation} from "index/App";
import {GameStatus} from "system/types/GameTypes";
import InGameChatBoard from "pages/ingame/Chat/InGameChatBoard";
import MusicModule from "pages/components/ui/MusicModule/MusicModule";

export default function InGame() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const myId = localCtx.getVal(LocalField.Id);
    const [roomCode, setRoomCode] = useState<number>(0);
    const amHost = TurnManager.amHost(ctx, localCtx);

    function checkSanity(): boolean {
        if (!amHost) return false;
        ReferenceManager.updateReference(DbFields.HEADER_hostId, myId);
        //TODO
        ReferenceManager.updateReference(
            DbFields.GAME,
            ctx.room.game
        );
        const alive = ctx.room.playerMap.size;
        if (!DS.StrictRules || alive > 1) return true;
        TransitionManager.pushEndGame()
        return true;
    }

    useEffect(() => {
        const res = checkSanity();
        if (!res) return;
        setRoomCode((n) => n++);
    }, [ctx.room.playerMap.size]);

    useEffect(() => {
        if (myId === null) {
            history.replace(Navigation.Loading);
        }
    }, [myId, history]);
    const status = ctx.room.game.status
    useEffect(() => {
        switch (status){
            case GameStatus.Lobby:
                history.replace(Navigation.Lobby);
                break;
            case GameStatus.InGame:
                break;
            case GameStatus.Over:
                history.replace(Navigation.GameFinish);
                break;

        }

    }, [status]);
    if (myId === null) return <Fragment/>;
    return (
        <div className={`${classes.container} ${gc.panelBackground}`}>
            <HorizontalLayout>
                <VerticalLayout className={`${classes.leftPanel}`}>
                    <MusicModule/>
                    <p>input panel</p>
                    <p>player list</p>
                </VerticalLayout>
                <div className={classes.rightPanel}>
                <InGameChatBoard/>
                </div>
            </HorizontalLayout>
        </div>
    );
}
