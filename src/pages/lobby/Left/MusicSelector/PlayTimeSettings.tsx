import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import classes from "pages/lobby/Left/LobbySettings.module.css";
import gc from "index/global.module.css";
import {InputManager} from "system/GameStates/InputManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Fragment, useContext, useEffect, useRef} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import ChatContext from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";

export default function PlayTimeSettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const chatCtx = useContext(ChatContext);
    const songNumRef = useRef<HTMLTextAreaElement>(null);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const numSongs = ctx.room.header.settings.songsPlay;
    useEffect(() => {
        if (numSongs > MusicManager.MusicList.length) {
            songNumRef.current!.value = MusicManager.MusicList.length + "";
            ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumRef.current!.value);
        }
    }, [MusicManager.MusicList.length]);

    function onFinishEditGuessTime(event: any) {
        if (!amHost) return;
        let guessTime = InputManager.cleanseTime(event, 5, 20);
        if (guessTime === null) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);
        chatCtx.announce(`답안제출시간: ${guessTime}`);

    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseSongs(event);
        songNumRef.current!.value = songNumber + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
        chatCtx.announce(`플레이 곡 수: ${songNumber}`);
    }

    return <Fragment>
        <HorizontalLayout>
            <p>재생시간:</p>
            <textarea
                className={`${classes.fieldTypeSmall}`}
                onBlur={onFinishEditGuessTime}
                defaultValue={ctx.room.header.settings.guessTime}
            />
        </HorizontalLayout>
        <HorizontalLayout className={gc.borderBottom}>
            <p>음악재생 곡 수</p>
            <textarea
                className={`${classes.fieldTypeSmall}`}
                ref={songNumRef}
                onBlur={onFinishEditSongNumbers}
                defaultValue={numSongs}
            />
        </HorizontalLayout>
    </Fragment>;
}