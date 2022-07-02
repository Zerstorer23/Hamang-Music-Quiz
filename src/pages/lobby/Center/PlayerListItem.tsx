import React from "react";
import classes from "./PlayerListItem.module.css";
import {IProps} from "system/types/CommonTypes";
import animClasses from "index/animation.module.css";

import gc from "index/global.module.css";
import {PlayerEntry} from "system/types/GameTypes";
import {PlayerManager} from "system/Database/PlayerManager";

type Prop = IProps & {
    playerEntry: PlayerEntry;
    isHost: boolean;
    showPromote: boolean;
    onPromote: any;
    index: number;
};


export default function PlayerListItem(props: Prop) {
    const hostCss = props.isHost ? classes.isHost : "";
    const player = props.playerEntry.player;
    const id = props.playerEntry.id;

    const name = `${(player.totalWin === 0) ? player.name : `${player.name} (${player.totalWin}점)`}`;
    let tagElem: JSX.Element;
    if (props.isHost) {
        tagElem = <div className={`${classes.hostPanel}`}>방장</div>;
    } else if (player.isReady) {
        tagElem = <div className={`${classes.readyPanel} ${animClasses.slideDown}`}>{("준비됨")}</div>;
    } else {
        tagElem = <div className={`${classes.readyPanel} ${animClasses.invisible}`}/>;
    }


    return (
        <div className={`${classes.item} ${gc.borderBottom} ${animClasses.fadeIn}`}>
            {tagElem}
            <p className={`${hostCss} ${classes.namePanel}`}>{name}</p>
            {
                (props.showPromote) && <div className={`${classes.playerOptionPanel}`}>
                    <button
                        className={`${classes.optionButton}`}
                        onClick={() => {
                            PlayerManager.kickPlayer(id);
                        }}>퇴장
                    </button>
                    <button
                        className={`${classes.optionButton}`} onClick={() => {
                        props.onPromote(id);
                    }}>방장위임
                    </button>

                </div>
            }

        </div>
    );
}

