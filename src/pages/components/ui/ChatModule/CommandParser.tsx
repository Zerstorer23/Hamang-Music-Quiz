import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {
    ChatContextType,
    ChatFormat,
    HiddenChats,
    sendAnnounce,
    sendChat
} from "pages/components/ui/ChatModule/system/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {GameConfigs} from "system/configs/GameConfigs";
import {LocalContextType, LocalField} from "system/context/localInfo/LocalContextProvider";
import {ProbeModule} from "pages/components/ui/ChatModule/system/ProbeModule";


export class CommandParser {
    public static handleCommands(
        ctx: RoomContextType,
        localCtx: LocalContextType,
        chatCtx: ChatContextType,
        command: string
    ) {
        const args = command.split(" ");
        const amHost = TurnManager.amHost(ctx, localCtx);
        switch (args[0]) {
            case "help":
                this.showHelp(chatCtx);
                break;
            case "coi":
            case "coin":
            case "coins":
                if (!amHost) return;
                if (ctx.room.header.games > 2) return;
                ReferenceManager.updateReference(
                    DbFields.HEADER_games,
                    ctx.room.header.games + GameConfigs.addGames
                );
                chatCtx.loadChat({
                    format: ChatFormat.announcement,
                    name: "",
                    msg: "게임을 더 하는것에 합의하였습니다.",
                });
                break;
            case "redirect":
                if (!amHost) return;
                sendChat(ChatFormat.hidden, "", HiddenChats.redirect);
                break;
            case "reload":
                if (!amHost) return;
                sendChat(ChatFormat.hidden, "", HiddenChats.reload);
                break;
            case "zero":
                if (!amHost) return;
                ctx.room.playerList.forEach((value) => {
                    ReferenceManager.updatePlayerFieldReference(value, PlayerDbFields.PLAYER_totalWin, 0);
                });
                sendAnnounce("점수가 초기화됨");
                break;
            case "ready":
                if (!amHost) return;
                ctx.room.playerList.forEach((value) => {
                    ReferenceManager.updatePlayerFieldReference(value, PlayerDbFields.PLAYER_isReady, true);
                });
                sendAnnounce("강제준비됨");
                break;
            case "block":
                ReferenceManager.updateReference(DbFields.HEADER_settings_blocker, !ctx.room.header.settings.blocker);
                break;
            case "probe":
                ProbeModule.prepareProbing(localCtx.getVal(LocalField.Id)!, ctx);
                break;
        }
    }

    private static showHelp(
        chatCtx: ChatContextType,
    ) {
        chatCtx.localAnnounce("/zero");
        chatCtx.localAnnounce("모든 플레이어의 점수를 초기화합니다 [방장용]");
        chatCtx.localAnnounce("/coins");
        chatCtx.localAnnounce("게임을 더 하는것으로 합의봅니다. [방장용]");
        chatCtx.localAnnounce("/ready");
        chatCtx.localAnnounce("모든 플레이어를 강제로 준비상태로 만듭니다. [방장용]");
        chatCtx.localAnnounce("/probe");
        chatCtx.localAnnounce("AFK로 판단되는 유저를 감지하고 삭제 [누구나]");
    }

}

