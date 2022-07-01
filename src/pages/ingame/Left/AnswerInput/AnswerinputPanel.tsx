/* eslint-disable react-hooks/exhaustive-deps */
import classes from "./AnswerinputPanel.module.css";
import gc from "index/global.module.css";
import {TurnManager} from "system/GameStates/TurnManager";
import {Fragment, useContext, useEffect, useRef, useState} from "react";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {CursorFocusInfo, InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry, MusicStatus, Player, PlayerMap, RoomSettings} from "system/types/GameTypes";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import TransitionManager from "system/GameStates/TransitionManager";
import {currentTimeInMills} from "system/Constants/GameConstants";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";

const ASSIST_CHANCE = 2;
export default function AnswerInputPanel() {
    const [assistCount, setAssistCount] = useState(ASSIST_CHANCE);
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const {id: myId, player: myPlayer} = TurnManager.getMyInfo(ctx, localCtx);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const cursorFocus = localCtx.getVal(LocalField.InputFocus) as CursorFocusInfo;
    const musicEntry = ctx.room.game.musicEntry;
    const isRevealing = musicEntry.status === MusicStatus.Revealing;
    const amHost = TurnManager.amHost(ctx, localCtx);
    ///====Key listener====///
    useKeyListener([KeyCode.Space, KeyCode.Enter], onKeyDown);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (musicEntry.status !== MusicStatus.Playing) return;
        if (keyCode === KeyCode.Space) {
            if (document.activeElement === inputRef.current!) return;
            if (cursorFocus.state !== InputCursor.Idle) return;
            inputRef.current?.focus();
        } else if (keyCode === KeyCode.Enter) {
            if (document.activeElement !== inputRef.current!) return;
            inputRef.current!.blur();
        }
    }

    useEffect(() => {
        handleMusicStatus(musicEntry, inputRef, myId, myPlayer, ctx.room.header.settings);
        if (musicEntry.status === MusicStatus.WaitingMusic) {
            setAssistCount(ASSIST_CHANCE);
        }
    }, [musicEntry.status]);

    function toggleFocus(toggle: boolean) {
        const cursorInfo: CursorFocusInfo = {
            time: currentTimeInMills(),
            state: toggle ? InputCursor.AnswerInput : InputCursor.Idle
        };
        localCtx.setVal(LocalField.InputFocus, cursorInfo);
    }

    function onClickLobby() {
        if (!amHost) return;
        sendAnnounce("방장이 게임을 끝냈습니다.");
        TransitionManager.pushEndGame();
    }

    useEffect(() => {
        if (inputRef.current === null) return;
        let text = inputRef.current.value.toString();
        if (text.length <= 0) return;
        if (text === myPlayer.answer) return;
        if (cursorFocus.state !== InputCursor.Idle) return;
        insertAnswer(text, myPlayer, myId, musicEntry, ctx.room.playerMap);
        if (assistCount >= 0) setAssistCount((n) => n - 1);
    }, [cursorFocus.state]);
    const [enabledCss, hintText] = inferCss(musicEntry);
    const points = MusicManager.checkAnswer(ctx.room.game.musicEntry.music, myPlayer.answer, ctx.room.header.settings.useArtists);

    return <div className={classes.container}>
        {
            (amHost) &&
            <button className={classes.lobbyButton}
                    onClick={onClickLobby}
            >[방장]<br/>게임끝내기</button>
        }
        {
            (isRevealing) &&
            <p className={classes.textInput}>{getAnswerString(musicEntry, ctx.room.header.settings)}</p>
        }
        {
            (musicEntry.status === MusicStatus.Playing || musicEntry.status === MusicStatus.ReceivingAnswers) &&
            <div className={`${classes.textInputPanel}`}>
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
                {
                    (assistCount >= 0 && assistCount < 2) &&
                    <p className={`${classes.assistPanel} ${(points) ? gc.greenText : gc.redText}`}>
                        {`${points ? "정답" : "오답"}`}
                        <br/>
                        {`${points ? `+${points}점` : `${assistCount}/${ASSIST_CHANCE}`}`}
                    </p>
                }
            </div>

        }
        <p className={classes.playerNumDisplay}>
            {`${myPlayer.wins}점`}
            <br/>
            {`${ctx.room.playerList.length}명 플레이중`}</p>
    </div>;
}

function handleMusicStatus(musicEntry: MusicEntry, inputRef: any, myId: string, myPlayer: Player, settings: RoomSettings) {
    switch (musicEntry.status) {
        case MusicStatus.WaitingMusic:
            ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_answer, "");
            break;
        case MusicStatus.Playing:
            inputRef.current!.value = "";
            break;
        case MusicStatus.ReceivingAnswers:
            inputRef.current?.blur();
            break;
        case MusicStatus.Revealing:
            const points = MusicManager.checkAnswer(musicEntry.music, myPlayer.answer, settings.useArtists);
            if (points > 0) {
                MusicManager.addPoints({id: myId, player: myPlayer}, points);
            }
            if (myPlayer.isReady) {
                ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_isReady, false);
            }
            break;
    }
}

function insertAnswer(answer: string, myPlayer: Player, myId: string, music: MusicEntry, playerMap: PlayerMap) {
    if (answer.length > 100) answer = answer.substring(0, 100);
    ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_answer, answer);
    ReferenceManager.updatePlayerFieldReference(myId, PlayerDbFields.PLAYER_isReady, true);
    if (music.status !== MusicStatus.Playing) return;
    let allAnswered = true;
    playerMap.forEach((value, key) => {
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

function getAnswerString(musicEntry: MusicEntry, settings: RoomSettings): JSX.Element {
    const title = musicEntry.music.title;
    if (!settings.useArtists || musicEntry.music.artists.length === 0) return <Fragment>
        {`정답은 ${title}`}
    </Fragment>;
    return <Fragment>
        {`정답은 ${title}`}
        <br/>
        {`- ${musicEntry.music.artists[0].split(":").join(",")}`} </Fragment>;
}