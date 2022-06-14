import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "index/App";
import RoomContext from "system/context/roomInfo/room-context";
import LocalProvider, {LocalContext} from "system/context/localInfo/LocalContextProvider";
import RoomProvider from "system/context/roomInfo/RoomContextProvider";
import {BrowserRouter} from "react-router-dom";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <RoomProvider>
            <LocalProvider>
                <App/>
            </LocalProvider>
        </RoomProvider>
    </BrowserRouter>
);
