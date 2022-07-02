import {PlayerManager} from "system/Database/PlayerManager";
import {ChatFormat, HiddenChats, sendChat} from "pages/components/ui/ChatModule/system/ChatContextProvider";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";

const WAIT_IN_MILLS = 7000;

export class ProbeModule {
    private static vitals = new Set<string>();
    private static timeCounter = setTimeout(() => {
    }, 1);

    public static prepareProbing(myId: string, ctx: RoomContextType) {
        this.vitals.clear();
        this.vitals.add(myId);
        if (this.timeCounter !== null) {
            clearTimeout(this.timeCounter);
            this.timeCounter = setTimeout(() => {
                this.killGhosts(ctx);
            }, WAIT_IN_MILLS);
        }
        // console.log("잠수유저 찾기 시작", getGlobalMyId());
        sendChat(ChatFormat.hidden, myId, HiddenChats.probe);
    }

    public static replyToProbe(myId: string) {
//        console.log("살아있음 응답:", getGlobalMyId());
        sendChat(ChatFormat.hidden, myId, HiddenChats.reply);
    }

    public static registerReply(fromId: string) {
        this.vitals.add(fromId);
        // console.log("살아있음 확인: ", fromId);
    }

    public static killGhosts(ctx: RoomContextType) {
        ctx.room.playerList.forEach((id) => {
            if (this.vitals.has(id)) return;
            PlayerManager.kickPlayer(id);
        });
    }


}