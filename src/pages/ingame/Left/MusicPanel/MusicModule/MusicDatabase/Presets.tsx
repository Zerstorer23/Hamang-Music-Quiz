import {ItemPair} from "system/types/CommonTypes";

export enum PresetName {
    Base = "base",
    KyoAni = "kyoani",
    Idol765 = "i765",
    Others = "others",
    Vocaloids = "vocaloids",
    User = "user",
}

export const presetsList = [
    PresetName.Base,
    PresetName.Idol765,
    PresetName.KyoAni,
    PresetName.Vocaloids,
    PresetName.Others,
];

export function presetToName(preset: PresetName) {
    switch (preset) {
        case PresetName.Others:
            return "기타";
        case PresetName.Vocaloids:
            return "보컬로이드";
        case PresetName.Base:
            return "선택안함";
        case PresetName.KyoAni:
            return "쿄애니";
        case PresetName.Idol765:
            return "아이마스";
        case PresetName.User:
            return "사용자지정";

    }
}

export const presetPairs: ItemPair[] = presetsList.map((value) => {
    return {
        label: presetToName(value),
        value,
    };
});