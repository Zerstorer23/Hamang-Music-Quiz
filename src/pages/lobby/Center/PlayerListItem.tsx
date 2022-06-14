import React from "react";
import classes from "./PlayerListItem.module.css";
import {IProps} from "system/types/CommonTypes";
import animClasses from "index/animation.module.css";

import gc from "index/global.module.css";
import {Player, PlayerEntry} from "system/types/GameTypes";

type Prop = IProps & {
    player: Player;
    isHost: boolean;
};


export default function PlayerListItem(props: Prop) {
    const hostCss = props.isHost ? classes.isHost : "";
    //TODO
    const name = (props.player.wins === 0) ? props.player.name : `${props.player.name} (${props.player.gameWins}승)`;
    let tagElem: JSX.Element;
    if (props.isHost) {
        tagElem = <div className={`${classes.hostPanel}`}>방장</div>;
    } else if (props.player.isReady) {
        tagElem = <div className={`${classes.readyPanel} ${animClasses.slideDown}`}>{("준비됨")}</div>;
    } else {
        tagElem = <div className={`${classes.readyPanel} ${animClasses.invisible}`}/>;
    }
    return (
        <div className={`${classes.item} ${gc.borderBottom} ${animClasses.fadeIn}`}>
            {tagElem}
            <p className={`${hostCss} ${classes.namePanel}`}>{name}</p>
        </div>
    );
}
