import classes from "./PopUp.module.css";
import {Fragment, useContext, useEffect} from "react";
import ReactDOM from "react-dom";
import {IProps} from "system/types/CommonTypes";
import RoomContext from "system/context/roomInfo/room-context";

import animClasses from "index/animation.module.css";
import {MyTimer} from "pages/components/ui/MyTimer/MyTimer";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";

function Backdrop() {
    return (
        <div className={classes.backdrop}/>
    );
}


function GameOverWindow(props: IProps) {
    // const img = Card.getVictoryImage(props.card1, props.card2);
    return (
        <div className={`${classes.modal} ${animClasses.slideDown}`}>
            {/*<img className={classes.image} src={`${img}`} alt={"victory"}/>*/}
            {/*       <p className={classes.text}>{formatInsert(t, "_game_winner", props.player.name)}</p>
            <p className={classes.text}>{formatInsert(t, "_game_cardUsed",
                Card.getName(t, props.card1),
                Card.getName(t, props.card2))}</p>*/}
            <p className={classes.text}>{("_return_lobby")}<MyTimer/></p>
        </div>
    );
}

export default function GameOverPopUp() {
    const home = document.getElementById("overlays") as HTMLElement;
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const myId = localCtx.getVal(LocalField.Id);

    //TODO
    /*    useEffect(() => {
            if (player === undefined) return;
            if (myId !== winnerID) return;
            increaseWin(playerCards);
            const ref = ReferenceManager.getPlayerFieldReference(winnerID, PlayerDbFields.PLAYER_wins);
            ReferenceManager.atomicDeltaByRef(ref, 1);
        }, []);
        if (player === undefined) return <Fragment/>;*/

    return (
        <Fragment>
            {ReactDOM.createPortal(<Backdrop/>, home)}
            {ReactDOM.createPortal(<GameOverWindow/>, home)}
        </Fragment>
    );
}
