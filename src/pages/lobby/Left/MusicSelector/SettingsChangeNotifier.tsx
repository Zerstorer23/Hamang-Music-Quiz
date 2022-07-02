/* eslint-disable react-hooks/exhaustive-deps */
import {Fragment, useContext, useEffect} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import ChatContext from "pages/components/ui/ChatModule/system/ChatContextProvider";
import {getPlayAtName, getPlaySpeedName} from "pages/lobby/Left/MusicSelector/GamePlaySettings";

export default function SettingsChangeNotifier() {
    const ctx = useContext(RoomContext);
    const settings = ctx.room.header.settings;
    const chatCtx = useContext(ChatContext);

    useEffect(() => {
        if (settings.limitedCommunication) {
            chatCtx.localAnnounce(`채팅제한 켜짐.`);
            chatCtx.localAnnounce(`방장제외 디시콘만 사용합니다`);
        } else {
            chatCtx.localAnnounce("채팅제한 꺼짐");
        }
    }, [settings.limitedCommunication]);
    useEffect(() => {
        chatCtx.localAnnounce(`재생속도: ${getPlaySpeedName(+settings.speed)}`);
    }, [settings.speed]);
    useEffect(() => {
        chatCtx.localAnnounce(`재생모드: ${getPlayAtName(+settings.playAt)}`);
    }, [settings.playAt]);
    useEffect(() => {
        chatCtx.localAnnounce(`플레이 곡 수: ${settings.songsPlay}`);
    }, [settings.songsPlay]);
    useEffect(() => {
        chatCtx.localAnnounce(`답안제출시간: ${settings.guessTime}`);
    }, [settings.guessTime]);

    return <Fragment/>;
}