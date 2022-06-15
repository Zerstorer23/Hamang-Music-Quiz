import MusicModule from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {MyTimer} from "pages/components/ui/MyTimer/MyTimer";
import gc from "index/global.module.css";

import classes from "./MusicPanel.module.css";
import {useContext} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {MusicStatus} from "system/types/GameTypes";
import {TurnManager} from "system/GameStates/TurnManager";

export default function MusicPanel() {
    const ctx = useContext(RoomContext);
    const isPlaying = ctx.room.game.music.status === MusicStatus.Playing;
    const isTakingAnswers = ctx.room.game.music.status === MusicStatus.ReceivingAnswers;
    const remainingSongs = TurnManager.getRemainingSongs(ctx);
    return <div className={`${classes.container} ${gc.borderColor} ${gc.round_border}`}>
        {isPlaying && <p className={classes.remainingGame}>{`${remainingSongs} 곡 남음`}</p>}
        <MusicModule/>
        {isPlaying && <p className={classes.remainingTime}><MyTimer/>초 남음...</p>}
        {isTakingAnswers && <p className={classes.remainingTime}>곧 정답을 공?개합니다</p>}
    </div>;
}