/* eslint-disable react-hooks/exhaustive-deps */
import {Fragment, useContext, useEffect} from "react";
import ChatContext, {ChatEntry, cleanChats} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {LISTEN_CHILD_ADDED, Snapshot} from "system/types/CommonTypes";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";

export default function ChatLoader() {
    const chatCtx = useContext(ChatContext);

    function onChatAdded(snapshot: Snapshot) {
        const ce: ChatEntry = snapshot.val();
        if (ce === null || ce === undefined) return;
        chatCtx.loadChat(ce);
    }

    useEffect(() => {
        cleanChats();
        const chatRef = ReferenceManager.getRef(DbFields.CHAT);
        chatRef.on(LISTEN_CHILD_ADDED, onChatAdded);
    }, []);


    return <Fragment/>;
}