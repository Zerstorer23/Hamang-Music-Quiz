/* eslint-disable react-hooks/exhaustive-deps */
import {Fragment, useContext, useEffect, useState} from "react";

import Papa from "papaparse";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import classes from "pages/lobby/Left/MusicSelector/MusicSelector.module.css";
import {IProps} from "system/types/CommonTypes";
import ChatContext from "pages/components/ui/ChatModule/system/ChatContextProvider";
import {PresetName} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/Presets";

const allowedExtensions = ["csv"];
type Props = IProps & {
    onUseCustom: any
}
export default function CSVLoader(props: Props) {

    const chatCtx = useContext(ChatContext);
    // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");

    useEffect(() => {
        if (error.length === 0) return;
        chatCtx.localAnnounce(error);
    }, [error]);
    // This function will be called when
    // the file input changes
    function handleFileChange(e: any) {
        setError("");

        // Check if user has entered the file
        if (e.target.files.length === 0) return;
        const inputFile = e.target.files[0];

        // Check the file extensions, if it not
        // included in the allowed extensions
        // we show the error
        const fileExtension = inputFile?.type.split("/")[1];
        if (!allowedExtensions.includes(fileExtension)) {
            setError(".CSV 파일이 아닙니다.");
            return;
        }
        // If input type is correct set the state
        handleParse(inputFile);

    }

    function handleParse(file: any) {
        // If user clicks the parse button without
        // a file we show a error
        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();
        // Event listener on reader when the fil
        // loads, we parse it and set the data.
        reader.onload = async ({target}: any) => {
            try {
                const csv = Papa.parse(target.result, {header: true});
                const success = MusicManager.parseCSV(csv, PresetName.User, (obj: any) => {
                    setError(`${obj}: 내부포맷이 잘못된 파일. 헤더명이 정확하고 내용에 ,이 없는지 확인해주세요.`);
                });
                if (!success) return;
                props.onUseCustom(PresetName.User);
            } catch (e) {
                setError(`내부포맷이 잘못된 파일. 헤더명이 정확하고 내용에 ,이 없는지 확인해주세요.`);
                return;
            }

        };
        reader.readAsText(file as any);

    }

    return <Fragment>
        <input
            className={classes.halfWidth}
            onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            placeholder={"커스텀"}
        />
    </Fragment>;
}
