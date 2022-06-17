import ImagePage from "pages/components/ui/ImagePage/ImagePage";
import {useContext, useEffect} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import classes from "pages/lobby/Lobby.module.css";

import gc from "index/global.module.css";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {GameStatus} from "system/types/GameTypes";
import {Navigation} from "index/App";

export default function LoadingPage() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const myId = localCtx.getVal(LocalField.Id);
    const gameState = ctx.room.game.gameStatus;
    useEffect(() => {
        if (myId === null) return;
        switch (gameState) {
            case GameStatus.Lobby:
                history.replace(Navigation.Lobby);
                break;
            case GameStatus.InGame:
                history.replace(Navigation.InGame);
                break;
            case GameStatus.Over:
                history.replace(Navigation.GameFinish);
                break;
        }
    }, [gameState, myId]);

    return <div className={`${classes.container} ${gc.panelBackground}`}>
        <ImagePage>
            로딩중입니다...[10초이상 걸리면 새로고침 추천]
        </ImagePage>;
    </div>;
}