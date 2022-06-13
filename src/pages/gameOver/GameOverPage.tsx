import classes from "pages/ingame/InGame.module.css";
import {useContext, useEffect} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import {TurnManager} from "system/GameStates/TurnManager";
import GameOverPopUp from "pages/components/ui/PopUp/PopUp";
import {forceSetTimer} from "pages/components/ui/MyTimer/MyTimer";
import gc from "global.module.css";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {WaitTime} from "system/Constants/GameConstants";
import TransitionManager from "system/GameStates/TransitionManager";
import {Navigation} from "index/App";
import {GameStatus} from "system/types/GameTypes";

export default function GameOverPage() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const amHost = TurnManager.amHost(ctx, localCtx);
    useEffect(() => {
        forceSetTimer(localCtx, WaitTime.WaitReactions, () => {
            if (!amHost) return;
             TransitionManager.pushLobby();
        });
    }, [amHost]);
    useEffect(() => {
        if (ctx.room.game.status === GameStatus.Lobby) {
            history.replace(Navigation.Lobby);
        }
    }, [ctx.room.game.status]);

    return <div className={`${classes.container} ${gc.panelBackground}`}>
        <GameOverPopUp/>
    </div>;
}