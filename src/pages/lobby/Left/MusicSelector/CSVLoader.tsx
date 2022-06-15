import {Fragment, useEffect, useState} from "react";

import Papa from "papaparse";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import classes from "./GenreBox.module.css";

const allowedExtensions = ["csv"];
export default function CSVLoader() {

    // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");

    useEffect(() => {
        console.warn(error);
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
            setError("Please input a csv file");
            return;
        }
        // If input type is correct set the state
        handleParse(inputFile);

    }

    function handleParse(file: any) {
        // If user clicks the parse button without
        // a file we show a error
        console.log("File chosen", file);
        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();

        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({target}: any) => {
            try {
                const csv = Papa.parse(target.result, {header: true});
                MusicManager.parseCSV(csv, true, (obj: any) => {
                    console.log("Exception", obj);
                });
            } catch (e) {
                setError("Enter a valid file");
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
