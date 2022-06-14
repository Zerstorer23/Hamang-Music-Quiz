import {IProps} from "system/types/CommonTypes";
import {MusicStatus, PlayerEntry} from "system/types/GameTypes";
import classes from "./PlayerGridItem.module.css";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import {useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import animCss from "index/animation.module.css";

type Props = IProps & {
    entry: PlayerEntry
    isMe: boolean
    index: number
}

export default function PlayerGridItem(props: Props) {
    const id = props.entry.id;
    const ctx = useContext(RoomContext);
    const player = props.entry.player;
    const music = ctx.room.game.music;
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
        const isAnswer = MusicManager.checkAnswer(music.vid, player.answer);
        setGotCorrect(isAnswer);

    }, [music.status, player.answer]);

    const answerCss = (gotCorrect) ? `${classes.correct} ${animCss.zoomIn}` : "";

    return <div className={`${classes.cell} ${cellCss}`}>
        <p>
            {`${cssIndex}. ${player.name} (${player.wins}점)`}
        </p>
        {
            (revealAnswers) &&
            <p className={`${answerCss}`}>{player.answer}</p>
        }
    </div>;
}