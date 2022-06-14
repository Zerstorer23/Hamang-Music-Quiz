import classes from "./PlayersPanel.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {useContext} from "react";
import {PlayerManager} from "system/Database/PlayerManager";
import gc from "index/global.module.css";
import PlayerGridItem from "pages/ingame/Left/Players/PlayerGridItem";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";

export default function PlayersPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const sortedPlayers = PlayerManager.sortByWins(ctx.room.playerMap, ctx.room.playerList);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);

    return <div className={`${classes.container} ${gc.round_border} ${gc.borderColor}`}>
        {
            sortedPlayers.map((player, index, array) => {
                return <PlayerGridItem
                    key={player.id}
                    entry={player}
                    isMe={myEntry.id === player.id}
                    index={index}
                />;
            })
        }
    </div>;
}