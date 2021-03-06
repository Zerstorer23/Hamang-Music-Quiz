
import gc from "index/global.module.css";
import classes from "./InGameChatBoard.module.css";
import React from "react";
import ChatModule from "pages/components/ui/ChatModule/ChatModule";

export default function InGameChatBoard(): JSX.Element {
    return (
        <div className={`${gc.round_border} ${gc.borderColor} ${classes.container}`}>
            <ChatModule/>
        </div>
    );
}
