import React, {useCallback, useContext, useEffect, useRef} from "react";
import classes from "./ChatModule.module.css";
import ChatContext, {
    ChatEntryToElem,
    ChatFormat,
    sendChat,
} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import RoomContext from "system/context/roomInfo/room-context";
import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {CursorFocusInfo, InputCursor, LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import useKeyListener, {KeyCode} from "system/hooks/useKeyListener";
import {CommandParser} from "pages/components/ui/ChatModule/CommandParser";
import sendToPort from "pages/components/ui/ChatModule/ChatRelay";
import {InputManager} from "system/GameStates/InputManager";
import {currentTimeInMills, elapsedSinceInMills, randomInt} from "system/Constants/GameConstants";

export default function ChatModule() {
    const chatCtx = useContext(ChatContext);
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);

    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatFieldRef = useRef<HTMLTextAreaElement>(null);
    const cursorFocus = localCtx.getVal(LocalField.InputFocus) as CursorFocusInfo;

    useEffect(() => {
        messagesEndRef.current!.scrollIntoView({behavior: "smooth"});
    }, [chatCtx.chatList.length]);
    ///====Key listener====///
    useKeyListener([KeyCode.Enter], onKeyDown);

    function onKeyDown(keyCode: KeyCode) {
        if (keyCode === KeyCode.Undefined) return;
        if (document.activeElement === chatFieldRef.current!) {
            handleSend();
            return;
        }
        if (cursorFocus.state === InputCursor.Idle) {
            const elapsed = elapsedSinceInMills(cursorFocus.time);
            if (elapsed <= 250) return;
            chatFieldRef.current!.focus();
        }
    }


    const handleSpecials = useCallback(
        (text: string) => {
            if (text.length < 2) return false;
            const firstChar = text.at(0);
            const theRest = text.substring(1);
            if (firstChar === "/") {
                CommandParser.handleCommands(ctx, localCtx, chatCtx, theRest);
                return true;
            }
            return false;
        },
        [myEntry.id, chatCtx]
    );

    const handleSend = useCallback(() => {
        let text = chatFieldRef.current!.value.toString();
        chatFieldRef.current!.value = "";
        text = InputManager.cleanseChat(text);
        if (text.length <= 0) {
            chatFieldRef.current!.blur();
            return;
        }
        if (handleSpecials(text)) return;
        sendToPort(text);
        sendChat(ChatFormat.normal, myEntry.player.name, text);
    }, [handleSpecials, myEntry]);

    function toggleFocus(toggle: boolean) {
        const cursorInfo: CursorFocusInfo = {
            time: currentTimeInMills(),
            state: toggle ? InputCursor.Chat : InputCursor.Idle
        };
        localCtx.setVal(LocalField.InputFocus, cursorInfo);
    }


    return (
        <div className={`${classes.container}`}>
            <div className={classes.chatbox}>
                {chatCtx.chatList.map((chat, index) => {
                    return ChatEntryToElem(index, chat);
                })}
                <div ref={messagesEndRef}/>
            </div>
            <HorizontalLayout className={classes.sendBox}>
        <textarea
            ref={chatFieldRef}
            className={classes.inputField}
            placeholder={"Enter로 채팅 시작..."}
            onBlur={() => {
                toggleFocus(false);
            }}
            onFocus={() => {
                toggleFocus(true);
            }}
        ></textarea>
                <button className={classes.buttonSend} onClick={handleSend}>
                    전송
                </button>
            </HorizontalLayout>
        </div>
    );
}

