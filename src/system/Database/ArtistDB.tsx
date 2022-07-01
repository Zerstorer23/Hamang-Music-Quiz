import {InputManager} from "system/GameStates/InputManager";

export class ArtistDB {
    public static imasArtistMap = new Map<string, string>();

    public static initIdolmasterArtistsMap() {
        this.imasArtistMap.clear();
        //HARUKA
        this.f("아마미 하루카", "하루카");
        this.f("아마미", "하루카");
        this.f("Amami Haruka", "하루카");
        this.f("Haruka", "하루카");
        this.f("Amami", "하루카");
        //CHIHAYA
        this.f("키사라기 치하야", "치하야");
        this.f("키사라기", "치하야");
        this.f("Kisaragi Chihaya", "치하야");
        this.f("Chihaya", "치하야");
        this.f("Kisaragi", "치하야");
        this.f("호시이 미키", "미키");
        this.f("호시이", "미키");
        this.f("Hoshii Miki", "미키");
        this.f("Miki", "미키");
        this.f("Hoshii", "미키");
        this.f("하기와라 유키호", "유키호");
        this.f("하기와라", "유키호");
        this.f("Hagiwara", "유키호");
        this.f("Yukiho", "유키호");
        this.f("Hagiwara Yukiho", "유키호");
        this.f("타카츠키야요이", "야요이");
        this.f("타카츠키", "야요이");
        this.f("TakatsukiYayoi", "야요이");
        this.f("Takatsuki", "야요이");
        this.f("Yayoi", "야요이");
        this.f("아키즈키리츠코", "리츠코");
        this.f("AkizukiRitsuko", "리츠코");
        this.f("Ritsuko", "리츠코");
        this.f("미우라아즈사", "아즈사");
        this.f("미우라", "아즈사");
        this.f("Miura Azusa", "아즈사");
        this.f("Miura", "아즈사");
        this.f("Azusa", "아즈사");
        this.f("미나세이오리", "이오리");
        this.f("미나세", "이오리");
        this.f("MinaseIori", "이오리");
        this.f("Iori", "이오리");
        this.f("Minase", "이오리");
        this.f("KikuchiMakoto", "마코토");
        this.f("Kikuchi", "마코토");
        this.f("Makoto", "마코토");
        this.f("키쿠치", "마코토");
        this.f("키쿠치마코토", "마코토");
        this.f("FutamiAmi", "아미");
        this.f("Ami", "아미");
        this.f("후타미아미", "아미");
        this.f("후타미마미", "마미");
        this.f("FutamiMami", "마미");
        this.f("Mami", "마미");
        this.f("ShijouTakane", "타카네");
        this.f("Shijou", "타카네");
        this.f("Takane", "타카네");
        this.f("시죠타카네", "타카네");
        this.f("시죠", "타카네");
        this.f("GanahaHibiki", "히비키");
        this.f("Ganaha", "히비키");
        this.f("Hibiki", "히비키");
        this.f("가나하", "히비키");
        this.f("가나하히비키", "히비키");
        this.f("OtonashiKotori", "코토리");
        this.f("Otonashi", "코토리");
        this.f("Kotori", "코토리");
        this.f("오토나시코토리", "코토리");
        this.f("오토나시", "코토리");
        this.f("카미이즈미레온", "레온");
        this.f("카미이즈미", "레온");
        this.f("Kamiizumi", "레온");
        this.f("KamiizumiLeon", "레온");
        this.f("Leon", "레온");
        this.f("OkuzoraKohaku", "코하쿠");
        this.f("Okuzora", "코하쿠");
        this.f("Kohaku", "코하쿠");
        this.f("오쿠조라", "코하쿠");
        this.f("오쿠조라코하쿠", "코하쿠");
        this.f("Shiika", "시이카");
        this.f("Aya", "아야");
        this.f("HidakaAi", "아이");
        this.f("Hidaka", "아이");
        this.f("Ai", "아이");
        this.f("히다카", "아이");
        this.f("히다카아이", "아이");
        this.f("아키즈키료", "료");
        this.f("AkizukiRyo", "료");
        this.f("Ryo", "료");
        this.f("MizutaniEllie", "에리");
        this.f("Mizutani", "에리");
        this.f("Ellie", "에리");
        this.f("MizutaniEri", "에리");
        this.f("Eri", "에리");
        this.f("미즈타니에리", "에리");
        this.f("Jupiter", "주피터");
        this.f("쥬피터", "주피터");
        this.f("765올스타즈", "765");
        this.f("765올스타", "765");
        this.f("765ALLSTARS", "765");
        this.f("765proALLSTARS", "765");
        this.f("765pro", "765");
        this.f("765프로", "765");
        this.f("765프로덕션", "765");
        this.f("765Production", "765");
        this.f("IdolMasterAllStars", "ImasAllStars");
        this.f("ProjectLuminous", "프로젝트 루미너스");
        this.f("LuminousRufus", "루미너스 루푸스");
        this.f("LuminousGiallo", "루미너스 잘로");
        this.f("LuminousAzure", "루미너스 아주르");
        this.f("DearlyStars", "디어리스타즈");
        this.f("고어리", "디어리 스타즈");
        this.f("디어리", "디어리 스타즈");
        this.f("IdolMasterAllStars", "ImasAllStars");
        this.f("ProjectFairy", "프로젝트 페어리");
        this.f("Ryuuguukomachi", "류구코마치");
    }

    private static f(k: string, v: string) {
        ArtistDB.imasArtistMap.set(InputManager.cleanseAnswer(k), v);
    }


}