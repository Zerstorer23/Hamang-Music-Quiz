import React, {Fragment, useState} from "react";
import {IProps} from "system/types/CommonTypes";
import classes from "pages/components/ui/ChatModule/ChatModule.module.css";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {currentTimeInMills, elapsedSinceInMills} from "system/Constants/GameConstants";
import {GameConfigs} from "system/configs/GameConfigs";
import {ConClass, DCconList} from "resources/DCconDB";
import animCss from "index/animation.module.css";
import {ProbeModule} from "pages/components/ui/ChatModule/system/ProbeModule";
import {getGlobalMyId} from "system/context/localInfo/LocalContextProvider";

export type ChatContextType = {
    chatList: ChatEntry[];
    loadChat: (a: ChatEntry) => void;
    localAnnounce: (a: string) => void;
};


const ChatContext = React.createContext<ChatContextType>({
    chatList: [],
    loadChat: (a: ChatEntry) => {
    },
    localAnnounce: (a: string) => {
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

export enum HiddenChats {
    redirect = "redirect",
    reload = "reload",
    probe = "probe",
    reply = "reply",
}


export function cleanChats() {
    const ref = ReferenceManager.getRef(DbFields.CHAT);
    ref.remove();
}

function isCon(msg: string): ConClass | null {
    if (msg.at(0) !== "#") return null;
    for (let con of DCconList) {
        if (msg === `#${con.text}`) {
            return con.con;
        }
    }
    return null;
}

export function ChatEntryToElem(key: any, ce: ChatEntry): JSX.Element {
    switch (ce.format) {
        case ChatFormat.normal:
            const text = `[${ce.name}] ${ce.msg}`;
            const paragraph = <p className={classes.normalChat} key={key}>{text}</p>;
            const conInfo = isCon(ce.msg);
            if (conInfo !== null) {
                return <Fragment key={key}>
                    {paragraph}
                    <img alt={ce.msg}
                         className={animCss.slideUp}
                         src={`/images/${conInfo}`}
                    />
                </Fragment>;
            } else {
                return paragraph;
            }
        case ChatFormat.announcement:
            return <p className={classes.announceChat} key={key}>{ce.msg}</p>;
        case ChatFormat.important:
            return <p className={classes.importantChat} key={key}>{ce.msg}</p>;
        case ChatFormat.hidden:
            return <Fragment key={key}/>;
    }
}

export function handleHidden(ce: ChatEntry, myId: string) {
    const msg = ce.msg as HiddenChats;
    switch (msg) {
        case HiddenChats.redirect:
            window.location.href = 'https://suzumiya.haruhi.boats/';
            break;
        case HiddenChats.reload:
            window.location.href = 'https://music.haruhi.boats/';
            break;
        case HiddenChats.reply:
            ProbeModule.registerReply(ce.name);
            break;
        case HiddenChats.probe:
            ProbeModule.replyToProbe(myId);
            break;
    }
}

export function ChatProvider(props: IProps) {
    const [chatList, setChatList] = useState<ChatEntry[]>([]);

    function loadChat(ce: ChatEntry) {
        if (ce === null) return;
        if (ce.format === ChatFormat.hidden) {
            handleHidden(ce, getGlobalMyId());
            return;
        }
        setChatList((prev) => [...prev, ce]);
    }

    function localAnnounce(a: string) {
        const ce = {
            format: ChatFormat.announcement,
            name: "",
            msg: a
        };
        loadChat(ce);
    }

    const context: ChatContextType = {
        chatList,
        loadChat,
        localAnnounce,
    };
    return (
        <ChatContext.Provider value={context}>
            {props.children}
        </ChatContext.Provider>
    );
}

let timeList: number[] = [];

export function sendChat(format: number, name: string, msg: string): boolean {
    const ce: ChatEntry = {name, msg, format};
    if (chatIsBusy(ce)) {
        return false;
    }
    const ref = ReferenceManager.getRef(DbFields.CHAT);
    ref.push(ce);
    return true;
}

export function sendAnnounce(a: string) {
    sendChat(ChatFormat.announcement, "", a);
}

function chatIsBusy(ce: ChatEntry): boolean {
    if (ce.format !== ChatFormat.normal) return false;
    timeList = timeList.filter((value, index, array) => {
        return elapsedSinceInMills(value) <= 10000;
    });
    if (timeList.length < GameConfigs.chatsInTenSec) {
        timeList.push(currentTimeInMills());
        return false;
    }
    return true;

}

export default ChatContext;