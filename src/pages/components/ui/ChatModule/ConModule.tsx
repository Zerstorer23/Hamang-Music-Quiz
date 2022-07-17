import classes from "pages/components/ui/ChatModule/ChatModule.module.css";
import gc from "index/global.module.css";
import {DCConButtonType, DCconList} from "resources/DCconDB";
import React, {useContext} from "react";
import {IProps} from "system/types/CommonTypes";
import ChatContext, {ChatFormat, sendChat} from "pages/components/ui/ChatModule/system/ChatContextProvider";

type Props = IProps & {
    height: string;
    show: boolean;
    myName: string;
}
export default function ConModule(p: Props) {

    const chatCtx = useContext(ChatContext);

    function onClickCon(conType: DCConButtonType) {
        const success = sendChat(ChatFormat.normal, p.myName, `#${conType.text}`);
        if (!success) {
            chatCtx.localAnnounce("채팅을 너무 자주 보내셨습니다...");
        }
    }

    return <div className={`${classes.dcConPanel} ${(p.show) ? "" : gc.hidden}`} style={{height: p.height}}>
        {
            DCconList.map((value, index) => {
                return <button
                    key={index}
                    className={classes.dcconButton}
                    onClick={() => {
                        onClickCon(value);
                    }}
                >
                    {`${value.text}`}
                </button>;
            })
        }
    </div>;
}