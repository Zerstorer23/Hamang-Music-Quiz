import classes from "./AnswerinputPanel.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import {useContext, useEffect, useRef, useState} from "react";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry, MusicStatus, Player, PlayerMap} from "system/types/GameTypes";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import TransitionManager from "system/GameStates/TransitionManager";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";


export default function AnswerInputPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [focused, setFocused] = useState(false);
    const {id: myId, player: myPlayer} = TurnManager.getMyInfo(ctx, localCtx);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const music = ctx.room.game.music;
    ///====Key listener====///
    useKeyListener([KeyCode.Space], onKeyDown);

    const focus = localCtx.getVal(LocalField.InputFocus);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (focus !== InputCursor.Idle) return;
        if (document.activeElement === inputRef.current!) return;
        if (music.status === MusicStatus.Revealing) return;
        inputRef.current?.focus();
    }

    useEffect(() => {
        handleMusicStatus(music, inputRef, myId, myPlayer);
    }, [music.status]);

    function handleSend() {
        insertAnswer(inputRef, myPlayer, myId, music, ctx.room.playerMap);
    }

    useEffect(() => {
        if (focused) return;
        handleSend();
    }, [focused]);
    const enabledCss = music.status === MusicStatus.Playing ? "" : classes.isDisabled;
    const hintText = music.status === MusicStatus.Playing ? "[Space] 정답을 입력..." : "정답 확인중... [정답에는 특수문자가 절대 없습니다]";

    return <div className={classes.container}>
       <textarea className={`${classes.textInput} ${enabledCss}`}
                 ref={inputRef}
                 placeholder={hintText}
                 onBlur={() => {
                     setFocused(false);
                 }}
                 onFocus={() => {
                     setFocused(true);
                 }}
       />
    </div>;
}

function handleMusicStatus(music: MusicEntry, inputRef: any, myId: string, myPlayer: Player) {
    switch (music.status) {
        case MusicStatus.WaitingMusic:
            inputRef.current!.value = "";
            ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_answer, "");
            break;
        case MusicStatus.Playing:
            break;
        case MusicStatus.ReceivingAnswers:
            inputRef.current?.blur();
            break;
        case MusicStatus.Revealing:
            const isAnswer = MusicManager.checkAnswer(music.vid, myPlayer.answer);
            if (isAnswer) {
                MusicManager.addPoints({id: myId, player: myPlayer});
            }
            if (myPlayer.isReady) {
                ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_isReady, false);
            }
            break;
    }
}

function insertAnswer(inputRef: any, myPlayer: Player, myId: string, music: MusicEntry, playerMap: PlayerMap) {
    let text = inputRef.current!.value.toString();
    if (text.length <= 0) return;
    if (text === myPlayer.answer) return;
    console.log("Send " + text);
    ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_answer, text);
    ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_isReady, true);
    if (music.status !== MusicStatus.Playing) return;
    let allAnswered = true;
    playerMap.forEach((value, key, map) => {
        if (!allAnswered) return;
        if (key === myId) return;
        if (!value.isReady) allAnswered = false;
    });
    if (allAnswered) {
        TransitionManager.pushMusicState(MusicStatus.ReceivingAnswers);
    }
}