import classes from "./PopUp.module.css";
import {Fragment, useContext} from "react";
import ReactDOM from "react-dom";
import RoomContext from "system/context/roomInfo/room-context";

import animClasses from "index/animation.module.css";
import {MyTimer} from "pages/components/ui/MyTimer/MyTimer";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {PlayerManager} from "system/Database/PlayerManager";
import {TurnManager} from "system/GameStates/TurnManager";
import gc from "index/global.module.css";

function Backdrop() {
    return (
        <div className={classes.backdrop}/>
    );
}


function GameOverWindow() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const sortedPlayers = PlayerManager.sortByWins(ctx.room.playerMap, ctx.room.playerList);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);

    return (
        <div className={`${classes.modal} ${animClasses.slideDown}`}>
            {sortedPlayers.map((value, index) => {
                const player = value.player;
                const playerCss = (value.id === myEntry.id) ? gc.greenText : " ";
                if (index > 7) return <Fragment key={index}/>;
                return <p className={`${classes.item} ${playerCss}`}
                          key={index}>{`${index + 1}.${player.name} [${player.wins}승]`}</p>;
            })}
            <p className={classes.text}><MyTimer/>초후 로비로 복귀...</p>
        </div>
    );
}

export default function GameOverPopUp() {
    const home = document.getElementById("overlays") as HTMLElement;
    return (
        <Fragment>
            {ReactDOM.createPortal(<Backdrop/>, home)}
            {ReactDOM.createPortal(<GameOverWindow/>, home)}
        </Fragment>
    );
}
