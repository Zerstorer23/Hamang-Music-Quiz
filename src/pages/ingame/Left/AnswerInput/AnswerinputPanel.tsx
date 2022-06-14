import classes from "./AnswerinputPanel.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicStatus} from "system/types/GameTypes";

const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
export default function AnswerInputPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [focused, setFocused] = useState(false);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const musicStatus = ctx.room.game.music.status;
    ///====Key listener====///
    useKeyListener([KeyCode.Space], onKeyDown);

    const focus = localCtx.getVal(LocalField.InputFocus);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (focus !== InputCursor.Idle) return;
        if (document.activeElement === inputRef.current!) return;
        if (musicStatus === MusicStatus.Revealing) return;
        inputRef.current!.focus();
        //TODO Check if everyone is ready.
        //If ready. push
    }

    useEffect(() => {
        switch (musicStatus) {
            case MusicStatus.WaitingMusic:
                break;
            case MusicStatus.Playing:
                break;
            case MusicStatus.Revealing:
                inputRef.current!.blur();
                setTimeout(() => {
                    inputRef.current!.value = "";
                }, 500);
                break;
        }
    }, [musicStatus]);

    const handleSend = useCallback(() => {
        let text = inputRef.current!.value.toString();
        if (text.length <= 0) return;
        console.log("Send " + text);
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_answer, text);
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_isReady, true);
    }, [myEntry]);

    useEffect(() => {
        if (!focused) {
            handleSend();
        }

    }, [focused]);
    const enabledCss = musicStatus === MusicStatus.Revealing ? classes.isDisabled : "";

    return <div className={classes.container}>
       <textarea className={`${classes.textInput} ${enabledCss}`}
                 ref={inputRef}
                 placeholder={"정답을 입력... [특수문자 절대없음]"}
                 onBlur={() => {
                     setFocused(false);
                 }}
                 onFocus={() => {
                     setFocused(true);
                 }}
       />
    </div>;
}

