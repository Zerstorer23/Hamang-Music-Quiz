import React, {Fragment, useState} from "react";
import {IProps} from "system/types/CommonTypes";
import classes from "pages/components/ui/ChatModule/ChatModule.module.css";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";

export type ChatContextType = {
    chatList: ChatEntry[];
    loadChat: (a: ChatEntry) => void;
    announce: (a: string) => void;

};


const ChatContext = React.createContext<ChatContextType>({
    chatList: [],
    loadChat: (a: ChatEntry) => {
    },
    announce: (a: string) => {
    },
});
export type ChatEntry = {
    name: string;
    msg: string;
    format: ChatFormat;
}

export enum ChatFormat {
    normal,
    announcement,
    important,
    hidden,
}

export function cleanChats() {
    const ref = ReferenceManager.getRef(DbFields.CHAT);
    ref.remove();
}

export function ChatEntryToElem(key: any, ce: ChatEntry): JSX.Element {
    switch (ce.format) {
        case ChatFormat.normal:
            const text = `[${ce.name}] ${ce.msg}`;
            return <p className={classes.normalChat} key={key}>{text}</p>;
        case ChatFormat.announcement:
            return <p className={classes.announceChat} key={key}>{ce.msg}</p>;
        case ChatFormat.important:
            return <p className={classes.importantChat} key={key}>{ce.msg}</p>;
        case ChatFormat.hidden:
            return <Fragment key={key}/>;
    }
}

export function ChatProvider(props: IProps) {
    const [chatList, setChatList] = useState<ChatEntry[]>([]);

    function loadChat(ce: ChatEntry) {
        if (ce === null) return;
        setChatList((prev) => [...prev, ce]);
    }

    function announce(a: string) {
        loadChat({
            format: ChatFormat.announcement,
            name: "",
            msg: a,
        });
    }

    const context: ChatContextType = {
        chatList,
        loadChat,
        announce,
    };
    return (
        <ChatContext.Provider value={context}>
            {props.children}
        </ChatContext.Provider>
    );
}

export function sendChat(format: number, name: string, msg: string) {
    const ce: ChatEntry = {name, msg, format};
    const ref = ReferenceManager.getRef(DbFields.CHAT);
    ref.push(ce);
}

export default ChatContext;