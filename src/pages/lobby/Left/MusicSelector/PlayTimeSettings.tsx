import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import classes from "pages/lobby/Left/LobbySettings.module.css";
import gc from "index/global.module.css";
import {InputManager} from "system/GameStates/InputManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Fragment, useContext, useEffect, useRef} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";

export default function PlayTimeSettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const songNumRef = useRef<HTMLTextAreaElement>(null);
    const guessRef = useRef<HTMLTextAreaElement>(null);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const numSongs = ctx.room.header.settings.songsPlay;
    const currLen = MusicManager.MusicList.length;
    useEffect(() => {
        if (numSongs > currLen) {
            songNumRef.current!.value = currLen + "";
            ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, currLen);
        }
    }, [currLen]);

    useEffect(() => {
        songNumRef.current!.value = numSongs + "";
    }, [numSongs]);


    function onToggleSafeChat() {
        const toggle = !ctx.room.header.settings.limitedCommunication;
        ReferenceManager.updateReference(DbFields.HEADER_settings_limitedCommunication, toggle);
        if (toggle) {
            sendAnnounce(`채팅제한 켜짐. 채팅은 3글자만. 닉네임은 ㅇㅇ만 표기.`);
        } else {
            sendAnnounce("채팅제한 꺼짐");
        }
    }

    function onFinishEditGuessTime(event: any) {
        if (!amHost) return;
        let guessTime = InputManager.cleanseTime(event, 5, 20);
        if (guessTime === null) return;
        guessRef.current!.value = guessTime + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);
        sendAnnounce(`답안제출시간: ${guessTime}`);
    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseSongs(event);
        songNumRef.current!.value = songNumber + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
        sendAnnounce(`플레이 곡 수: ${songNumber}`);
    }

    return <Fragment>
        <input type="checkbox" id={"safeChat"}
               onChange={onToggleSafeChat}
               checked={ctx.room.header.settings.limitedCommunication}/>
        <label htmlFor={"safeChat"}>채팅제한</label>
        <HorizontalLayout>
            <p>재생시간:</p>
            <textarea
                ref={guessRef}
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