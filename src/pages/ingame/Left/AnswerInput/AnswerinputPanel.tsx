import classes from "./AnswerinputPanel.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {ChatFormat, sendChat} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {InputManager} from "system/GameStates/InputManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";

const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
export default function AnswerInputPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [focused, setFocused] = useState(false);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    ///====Key listener====///
    useKeyListener([KeyCode.Aphostrophe], onKeyDown);

    const focus = localCtx.getVal(LocalField.InputFocus);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (focus !== InputCursor.Idle) return;
        if (document.activeElement === inputRef.current!) return;
        inputRef.current!.focus();
    }


    const handleSend = useCallback(() => {
        let text = inputRef.current!.value.toString();
        text = InputManager.cleanseAnswer(text);
        if (text.length <= 0) return;
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_answer, text);
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_isReady, true);
    }, [myEntry]);

    useEffect(() => {
        if (!focused) {
            handleSend();
        }
    }, [focused]);


    return <div className={classes.container}>
       <textarea className={classes.textInput}
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

