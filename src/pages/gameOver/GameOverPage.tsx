import classes from "pages/ingame/InGame.module.css";
import {useContext, useEffect} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import {TurnManager} from "system/GameStates/TurnManager";
import GameOverPopUp from "pages/components/ui/PopUp/PopUp";
import {setMyTimer} from "pages/components/ui/MyTimer/MyTimer";

import gc from "index/global.module.css";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import TransitionManager from "system/GameStates/TransitionManager";
import {Navigation} from "index/App";
import {GameStatus} from "system/types/GameTypes";

export default function GameOverPage() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const status = ctx.room.game.status;
    const amHost = TurnManager.amHost(ctx, localCtx);
    useEffect(() => {
        setMyTimer(localCtx, 5, () => {
            if (!amHost) return;
            TransitionManager.pushLobby();
        });
    }, [amHost]);
    useEffect(() => {
        if (status === GameStatus.Lobby) {
            history.replace(Navigation.Lobby);
        }
    }, [status]);

    return <div className={`${classes.container} ${gc.panelBackground}`}>
        <GameOverPopUp/>
    </div>;
}