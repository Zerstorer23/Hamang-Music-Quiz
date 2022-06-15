import classes from "./AnswerinputPanel.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import {useContext, useEffect, useRef} from "react";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {CursorFocusInfo, InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry, MusicStatus, Player, PlayerMap} from "system/types/GameTypes";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import TransitionManager from "system/GameStates/TransitionManager";
import {currentTimeInMills} from "system/Constants/GameConstants";
import {InputManager} from "system/GameStates/InputManager";


export default function AnswerInputPanel() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const {id: myId, player: myPlayer} = TurnManager.getMyInfo(ctx, localCtx);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const cursorFocus = localCtx.getVal(LocalField.InputFocus) as CursorFocusInfo;
    const music = ctx.room.game.music;
    ///====Key listener====///
    useKeyListener([KeyCode.Space, KeyCode.Enter], onKeyDown);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (music.status !== MusicStatus.Playing) return;
        if (keyCode === KeyCode.Space) {
            if (document.activeElement === inputRef.current!) return;
            inputRef.current?.focus();
        } else if (keyCode === KeyCode.Enter) {
            if (document.activeElement !== inputRef.current!) return;
            inputRef.current!.blur();
        }
    }

    useEffect(() => {
        handleMusicStatus(music, inputRef, myId, myPlayer);
    }, [music.status]);

    function toggleFocus(toggle: boolean) {
        const cursorInfo: CursorFocusInfo = {
            time: currentTimeInMills(),
            state: toggle ? InputCursor.AnswerInput : InputCursor.Idle
        };
        localCtx.setVal(LocalField.InputFocus, cursorInfo);
    }

    useEffect(() => {
        let text = inputRef.current!.value.toString();
        if (text.length <= 0) return;
        if (text === myPlayer.answer) return;
        if (cursorFocus.state !== InputCursor.Idle) return;
        insertAnswer(text, myPlayer, myId, music, ctx.room.playerMap);
    }, [cursorFocus.state]);
    const [enabledCss, hintText] = inferCss(music);


    return <div className={classes.container}>
       <textarea className={`${classes.textInput} ${enabledCss}`}
                 ref={inputRef}
                 placeholder={hintText}
                 onBlur={() => {
                     toggleFocus(false);
                 }}
                 onFocus={() => {
                     toggleFocus(true);
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
            inputRef.current.value = `정답은 ${MusicManager.getMusic(music.vid)?.title}`;
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

function insertAnswer(answer: string, myPlayer: Player, myId: string, music: MusicEntry, playerMap: PlayerMap) {
    console.log("Send " + answer);
    ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_answer, answer);
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

function inferCss(music: MusicEntry) {
    let enabledCss = classes.isDisabled;
    let hintText = "[Space] 정답을 입력...";
    switch (music.status) {
        case MusicStatus.WaitingMusic:
            break;
        case MusicStatus.Playing:
            enabledCss = "";
            break;
        case MusicStatus.ReceivingAnswers:
            hintText = "정답 확인중... [정답에는 특수문자가 절대 없습니다]";
            break;
        case MusicStatus.Revealing:
            break;
    }

    return [enabledCss, hintText];
}