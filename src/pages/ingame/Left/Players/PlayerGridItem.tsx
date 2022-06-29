import {IProps} from "system/types/CommonTypes";
import {MusicStatus, PlayerEntry} from "system/types/GameTypes";
import classes from "./PlayerGridItem.module.css";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import {useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import animCss from "index/animation.module.css";
import gc from "index/global.module.css";

type Props = IProps & {
    entry: PlayerEntry
    isMe: boolean
    index: number
}

export default function PlayerGridItem(props: Props) {
    const ctx = useContext(RoomContext);
    const player = props.entry.player;
    const music = ctx.room.game.musicEntry;
    const cssIndex = props.index + 1;
    const cellCss = classes[`cell${cssIndex}`];
    const [gotCorrect, setGotCorrect] = useState(false);
    const revealAnswers = music.status === MusicStatus.Revealing || music.status === MusicStatus.ReceivingAnswers;

    useEffect(() => {
        if (music.status === MusicStatus.WaitingMusic) {
            setGotCorrect(false);
            return;
        }
        if (music.status !== MusicStatus.Revealing) return;
        const isAnswer = MusicManager.checkAnswer(music.music, player.answer, ctx.room.header.settings.useArtists);
        setGotCorrect(isAnswer);
    }, [music.status, player.answer]);

    const playerAnswerDisplay = (player.answer.replaceAll(" ", "").length === 0) ? "몰루겟소요..." : player.answer;
    const isReadyText = player.isReady ? " [제출완료]" : "";
    const answerCss = (gotCorrect) ? `${classes.correct} ${gc.greenText} ${animCss.zoomIn}` : `${animCss.slideUp}`;
    const playerCss = (props.isMe) ? gc.greenText : (player.isReady) ? gc.blueText : "";
    return <div className={`${classes.cell} ${cellCss}`}>
        <p className={playerCss}>
            {`${cssIndex}. ${player.name} (${player.wins}점) ${isReadyText}`}
        </p>
        {
            (revealAnswers) &&
            <p className={`${answerCss}`}>{playerAnswerDisplay}</p>
        }
    </div>;
}