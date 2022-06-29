import {DbRef} from "system/types/CommonTypes";
import {db} from "system/Database/Firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import {ObjectPool} from "system/Database/ObjectPool";
import {Player} from "system/types/GameTypes";

export enum DbFields {
    ROOT = "/",
    ROOM = "/room",
    GAME = "/room/game",
    GAME_musicEntry = "/room/game/musicEntry",
    GAME_musicEntry_status = "/room/game/musicEntry/status",
    GAME_status = "/room/game/gameStatus",
    PLAYERS = `/room/playerMap`,
    HEADER = `/room/header`,
    HEADER_hostId = `/room/header/hostId`,
    HEADER_seed = `/room/header/seed`,
    HEADER_games = `/room/header/games`,
    HEADER_settings = `/room/header/settings`,
    HEADER_settings_guessTime = `/room/header/settings/guessTime`,
    HEADER_settings_songsPlay = `/room/header/settings/songsPlay`,
    HEADER_settings_limitedCommunication = `/room/header/settings/limitedCommunication`,
    HEADER_settings_playAt = `/room/header/settings/playAt`,
    HEADER_settings_useArtists = `/room/header/settings/useArtists`,
    HEADER_settings_speed = `/room/header/settings/speed`,
    CHAT = "/chat",
}

export enum PlayerDbFields {
    PLAYER_name = "name",
    PLAYER_isReady = "isReady",
    PLAYER_wins = "wins",
    PLAYER_totalWin = "totalWin",
    PLAYER_answer = "answer",
}

/**
 * Reference Manager is responsible for
 * uploading data to Firebase.
 */
class _RefPool extends ObjectPool<string, DbRef> {


    instantiate(key: string): DbRef {
        return db.ref(key);
    }


}

const RefPool = new _RefPool();

export class ReferenceManager {
    public static channelId = -1;

    /**
     * @param field
     * @param value
     * UPdates a single value
     */
    public static updateReference<T>(field: DbFields, value: T) {
        const ref = ReferenceManager.getRef(field);
        ref.set(value);
    }

    /**
     *
     * @param playerId
     * @param player
     * UPdates a player
     */
    public static updatePlayerReference(playerId: string, player: Player) {
        const ref = ReferenceManager.getPlayerReference(playerId);
        ref.set(player);
    }

    public static getRef(refName: DbFields): DbRef {
        return RefPool.get(`${this.channelId}${refName}`);
    }

    public static getPlayerReference(playerId: string): DbRef {
        return RefPool.get(`${this.channelId}${DbFields.PLAYERS}/${playerId}`);
    }

    public static getPlayerFieldReference(playerId: string, ref: PlayerDbFields): DbRef {
        return RefPool.get(`${this.channelId}${DbFields.PLAYERS}/${playerId}/${ref}`);
    }

    public static updatePlayerFieldReference(playerId: string, tag: PlayerDbFields, value: any) {
        const ref = ReferenceManager.getPlayerFieldReference(playerId, tag);
        ref.set(value);
    }

    public static atomicDelta(refName: string, change: number) {
        const ref = RefPool.get(`${this.channelId}${refName}`);
        ref.set(firebase.database.ServerValue.increment(change));
    }

    public static atomicDeltaByRef(ref: DbRef, change: number) {
        ref.set(firebase.database.ServerValue.increment(change));
    }

    public static atomicDeltaByPlayerField(playerId: string, refName: PlayerDbFields, change: number) {
        const ref = this.getPlayerFieldReference(playerId, refName);
        ref.set(firebase.database.ServerValue.increment(change));
    }
}
