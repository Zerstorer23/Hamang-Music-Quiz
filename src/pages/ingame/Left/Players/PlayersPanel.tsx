import classes from "./PlayersPanel.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {Fragment, useContext} from "react";
import {PlayerManager} from "system/Database/PlayerManager";
import gc from "index/global.module.css";
import PlayerGridItem from "pages/ingame/Left/Players/PlayerGridItem";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {PlayerEntry} from "system/types/GameTypes";

const SMALL_SIZE = 8;

function getLastPlayer(lastVisibleIndex: number, myEntry: PlayerEntry, myRank: number, sortedPlayers: PlayerEntry[], maxPlayerCell: number) {
    let lastPlayer: PlayerEntry | null = myEntry;
    if (myRank < lastVisibleIndex) {
        //I am already visible.
        if (sortedPlayers.length >= maxPlayerCell) {
            //DIsplay someone else
            lastPlayer = sortedPlayers[lastVisibleIndex];
        } else {
            lastPlayer = null;
        }
    }
    if (lastPlayer === null) {
        return <Fragment key={lastVisibleIndex}/>;
    } else {
        return <PlayerGridItem
            key={lastVisibleIndex}
            entry={lastPlayer}
            isMe={lastPlayer.id === myEntry.id}
            index={lastVisibleIndex}
        />;
    }
}

export default function PlayersPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const sortedPlayers = PlayerManager.sortByWins(ctx.room.playerMap, ctx.room.playerList);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const myRank = sortedPlayers.findIndex((value, index, obj) => value.id === myEntry.id);
    const containerCss = (sortedPlayers.length <= SMALL_SIZE) ? classes.container8 : classes.container12;
    const maxPlayerCell = (sortedPlayers.length <= SMALL_SIZE) ? SMALL_SIZE : 12;
    const lastVisibleIndex = maxPlayerCell - 1;
    let lastElement = getLastPlayer(lastVisibleIndex, myEntry, myRank, sortedPlayers, maxPlayerCell);
    return <div className={`${containerCss} ${gc.round_border} ${gc.borderColor}`}>
        {
            sortedPlayers.map((player, index) => {
                if (index >= lastVisibleIndex) return <Fragment key={index}/>;
                return <PlayerGridItem
                    key={index}
                    entry={player}
                    isMe={myEntry.id === player.id}
                    index={index}
                />;
            })
        }
        {
            lastElement
        }
    </div>;
}