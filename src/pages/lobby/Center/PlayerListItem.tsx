import React from "react";
import classes from "./PlayerListItem.module.css";
import {IProps} from "system/types/CommonTypes";
import animClasses from "animation.module.css";
import {useTranslation} from "react-i18next";
import gc from "global.module.css";
import {Player, PlayerEntry} from "system/types/GameTypes";

type Prop = IProps & {
    player: Player;
    isHost: boolean;
};


export default function PlayerListItem(props: Prop) {
    const hostCss = props.isHost ? classes.isHost : "";
    const {t} = useTranslation();
    //TODO
    const name = (props.player.wins === 0) ? props.player.name : "Plaer with wins"
        // insert(t, "_name_with_wins", props.player.name, props.player.wins);
    let tagElem: JSX.Element;
    if (props.isHost) {
        tagElem = <div className={`${classes.hostPanel}`}>{t("_is_host")}</div>;
    } else if (props.player.isReady) {
        tagElem = <div className={`${classes.readyPanel} ${animClasses.slideDown}`}>{t("_is_ready")}</div>;
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
