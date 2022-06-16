import {ItemPair} from "system/types/CommonTypes";

export enum PresetName {
    Base = "base",
    KyoAni = "kyoani",
    Idol765 = "i765",
    User = "user",
}

export const presetsList = [
    PresetName.Base,
    PresetName.KyoAni,
    PresetName.Idol765];

export function presetToName(preset: PresetName) {
    switch (preset) {
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