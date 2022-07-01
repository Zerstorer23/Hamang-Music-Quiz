import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {
    ChatContextType,
    ChatFormat,
    sendAnnounce,
    sendChat
} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {GameConfigs} from "system/configs/GameConfigs";
import {LocalContextType} from "system/context/localInfo/LocalContextProvider";


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
                this.showHelp(ctx, localCtx, chatCtx, command);
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
                sendChat(ChatFormat.hidden, "", "redirect");
                break;
            case "reload":
                if (!amHost) return;
                sendChat(ChatFormat.hidden, "", "reload");
                break;
            case "kill":
                if (!amHost) return;
                this.kickPlayer(args, ctx);
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
        }
    }

    private static showHelp(
        ctx: RoomContextType,
        localCtx: LocalContextType,
        chatCtx: ChatContextType,
        command: string
    ) {
        chatCtx.localAnnounce("/kick [번호]");
        chatCtx.localAnnounce("[번호] 플레이어를 킥합니다. 번호는 로비 이름옆에 [0]같이 나옴 [방장용]");
        chatCtx.localAnnounce("/zero");
        chatCtx.localAnnounce("모든 플레이어의 점수를 초기화합니다 [방장용]");
        chatCtx.localAnnounce("/coins");
        chatCtx.localAnnounce("게임을 더 하는것으로 합의봅니다. [방장용]");
        chatCtx.localAnnounce("/ready");
        chatCtx.localAnnounce("모든 플레이어를 강제로 준비상태로 만듭니다. [방장용]");

    }

    private static kickPlayer(args: string[], ctx: RoomContextType) {
        let idx = +args[1];
        if (isNaN(idx)) return;
        idx--;
        const id = ctx.room.playerList[idx];
        if (id === undefined) return;
        ReferenceManager.getPlayerReference(id).remove();
        sendChat(ChatFormat.important, "", "잠수 의심 유저가 삭제됨");
    }
}

