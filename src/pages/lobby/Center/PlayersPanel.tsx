import classes from "./PlayersPanel.module.css";
import VerticalLayout from "pages/components/ui/VerticalLayout";
import PlayerListItem from "./PlayerListItem";
import {Fragment, useContext} from "react";
import RoomContext from "system/context/roomInfo/room-context";

import gc from "index/global.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Player, PlayerMap} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {DS} from "system/configs/DS";


export default function PlayersPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const playerMap: PlayerMap = ctx.room.playerMap;
    const currPlayer = playerMap.size;
    const playerList = ctx.room.playerList;
    const myId = localCtx.getVal(LocalField.Id);
    useKeyListener([KeyCode.Space], onKey);
    if (myEntry.id === null) return <Fragment/>;

    function onKey(keyCode: KeyCode) {
        if (localCtx.getVal(LocalField.InputFocus) === InputCursor.Chat) return;
        if (keyCode === KeyCode.Space) {
            onClickStart();
        }
    }

    function onClickStart() {
        console.log("Listen start " + amHost);
        if (amHost) {
            //Host action is start game
            if (DS.StrictRules) {
                if (playerList.length <= 1) return;
                if (!canStartGame(playerMap)) return;
            }
            const room = ctx.room;
            RoomManager.setStartingRoom(room);
        } else {
            //My action is ready
            const toggleReady = !myEntry.player.isReady;
            const ref = ReferenceManager.getPlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_isReady);
            ref.set(toggleReady);
        }
    }

    let buttonKey = getButtonKey(amHost, playerList, playerMap, myEntry.player);
    const numGames = ctx.room.header.games;
    const remainingCss = getRemainingCss(numGames);
    return (
        <VerticalLayout className={`${gc.round_border} ${gc.borderColor} ${classes.container} `}>
            <div className={`${classes.headerContainer} ${gc.borderBottom}`}>
                <p className={classes.headerTitle}>7번함</p>
                <p className={classes.headerPlayerNum}>{`연결됨: ${currPlayer}`}</p>
            </div>
            <VerticalLayout className={classes.list}>{
                playerList.map((id, index, array) => {
                    const player = playerMap.get(id)!;
                    return <PlayerListItem key={id} player={player}
                                           isHost={id === ctx.room.header.hostId}/>;
                })
            }</VerticalLayout>
            <div className={classes.bottomPanel}>
                <div className={`${classes.remainingGames} ${gc.borderColor} ${remainingCss}`}>
                    <p>
                        {`남은 게임: ${numGames}`}
                    </p>
                </div>
                {
                    (numGames > 0) ?
                        <button className={classes.buttonStart} onClick={onClickStart}>
                            {(buttonKey)}
                        </button> :
                        <p className={`${classes.noMoreCoins} ${gc.borderColor}`}>
                            {amHost ? ("_prompt_how_to") : ("_prompt_play_more_want")}
                        </p>
                }
            </div>
        </VerticalLayout>
    );
}

function canStartGame(playerMap: PlayerMap) {
    const numReady = countReadyPlayers(playerMap);
    return numReady >= (playerMap.size - 1);
}

function countReadyPlayers(playerMap: PlayerMap): number {
    let count = 0;
    playerMap.forEach((player, key, map) => {
        if (player.isReady) count++;
    });
    return count;
}

function getRemainingCss(n: number) {
    if (n > 6) return classes.lightBlue;
    if (n > 3) return classes.lightYellow;
    return classes.lightRed;
}

function getButtonKey(amHost: boolean, playerList: string[], playerMap: Map<string, Player>, myPlayer: Player) {
    if (amHost) {
        if (!canStartGame(playerMap)) {
            return "플레이어들이 준비를 마쳐야 합니다.";
        } else {
            return "시작";
        }
    } else {
        if (!myPlayer.isReady) {
            return "준비";
        } else {
            return "호스트가 게임을 시작하기를 기다리는 중";
        }
    }
}
