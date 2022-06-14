import {IProps} from "system/types/CommonTypes";
import {MusicStatus, PlayerEntry} from "system/types/GameTypes";
import classes from "./PlayerGridItem.module.css";
import {MusicManager} from "pages/components/ui/MusicModule/MusicManager";
import {useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import animCss from "index/animation.module.css";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";

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
    useEffect(() => {
        if (music.status === MusicStatus.WaitingMusic) {
            ReferenceManager.updatePlayerFieldReference(id, PlayerDbFields.PLAYER_answer, "");
            setGotCorrect(false);
            return;
        }
        const timeout = setTimeout(() => {
            if (music.status !== MusicStatus.Revealing) {
                return;
            }
            const isAnswer = MusicManager.checkAnswer(music.vid, player.answer);
            setGotCorrect(isAnswer);
            if (props.isMe) {
                if (isAnswer) {
                    MusicManager.addPoints({id, player});
                }
                ReferenceManager.updatePlayerFieldReference(id, PlayerDbFields.PLAYER_isReady, false);
            }

        }, 1000);//WWait thousnds in case reveal first and then submit aanswer
        return () => {
            clearTimeout(timeout);
        };
    }, [music.status, player.answer]);
    const answerCss = (gotCorrect) ? `${classes.correct} ${animCss.flash}` : "";
    return <div className={`${classes.cell} ${cellCss}`}>
        <p>
            {`${cssIndex}. ${player.name} (${player.wins}점)`}
        </p>
        {
            (music.status === MusicStatus.Revealing) &&
            <p className={`${answerCss}`}>{player.answer}</p>
        }
    </div>;
}