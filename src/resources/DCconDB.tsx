export enum ConClass {
    Ellie = "ellie.gif",
    Baka = "baka.png",
    Old = "old.png",
    God = "godsong.gif",
    Trash = "trash.png",
    More = "more.png",
    Sugoi = "sugoi.png",
    Unknown = "unknown.gif",
    WhatThe = "whatthe.png",
    Stop = "stop.png",
    Yes = "yes.png",
    No = "no.png",
}

export type DCConButtonType = {
    con: ConClass;
    text: string;
}
export const DCconList: DCConButtonType[] = [
    {
        con: ConClass.Unknown,
        text: "몰루"
    },
    {
        con: ConClass.Baka,
        text: "바보"
    },
    {
        con: ConClass.God,
        text: "띵곡"
    },
    {
        con: ConClass.Trash,
        text: "망곡"
    },
    {
        con: ConClass.Old,
        text: "틀"
    },
    {
        con: ConClass.Ellie,
        text: "에리"
    },
    {
        con: ConClass.More,
        text: "한판더"
    },
    {
        con: ConClass.Stop,
        text: "그만"
    },
    {
        con: ConClass.Yes,
        text: "ㅇㅇ"
    },
    {
        con: ConClass.No,
        text: "ㄴㄴ"
    },
    {
        con: ConClass.Sugoi,
        text: "대단한"
    },
    {
        con: ConClass.WhatThe,
        text: "ㅁㅊ"
    },
];
