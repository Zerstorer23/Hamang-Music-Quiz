import HorizontalLayout from "../components/ui/HorizontalLayout";
import VerticalLayout from "../components/ui/VerticalLayout";
import classes from "./InGame.module.css";
import {Fragment, useContext, useEffect} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import {TurnManager} from "system/GameStates/TurnManager";

import gc from "index/global.module.css";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {DS} from "system/configs/DS";
import TransitionManager from "system/GameStates/TransitionManager";
import {Navigation} from "index/App";
import {GameStatus} from "system/types/GameTypes";
import InGameChatBoard from "pages/ingame/Chat/InGameChatBoard";
import MusicModule from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import PlayersPanel from "pages/ingame/Left/Players/PlayersPanel";
import AnswerInputPanel from "pages/ingame/Left/AnswerInput/AnswerinputPanel";
import MusicPanel from "pages/ingame/Left/MusicPanel/MusicPanel";

export default function InGame() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const myId = localCtx.getVal(LocalField.Id);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const numPlayers = ctx.room.playerMap.size;

    useEffect(() => {
        if (myId === null) {
            history.replace(Navigation.Loading);
        }
    }, [myId, history]);
    const status = ctx.room.game.status;
    useEffect(() => {
        switch (status) {
            case GameStatus.Lobby:
                history.replace(Navigation.Lobby);
                break;
            case GameStatus.InGame:
                break;
            case GameStatus.Over:
                history.replace(Navigation.GameFinish);
                break;
        }
    }, [status, numPlayers]);
    if (myId === null) return <Fragment/>;
    return (
        <div className={`${classes.container} ${gc.panelBackground}`}>
            <HorizontalLayout>
                <VerticalLayout className={`${classes.leftPanel}`}>
                    <div className={classes.musicPanel}>
                        <MusicPanel/>
                        {/*<Fragment/>*/}
                    </div>
                    <div className={classes.answerPanel}>
                        <AnswerInputPanel/>
                    </div>
                    <div className={classes.playersPnael}>
                        <PlayersPanel/>
                    </div>
                </VerticalLayout>
                <div className={classes.rightPanel}>
                    <InGameChatBoard/>
                </div>
            </HorizontalLayout>
        </div>
    );
}
