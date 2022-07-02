import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "index/App";
import LocalProvider from "system/context/localInfo/LocalContextProvider";
import RoomProvider from "system/context/roomInfo/RoomContextProvider";
import {BrowserRouter} from "react-router-dom";
import {ChatProvider} from "pages/components/ui/ChatModule/system/ChatContextProvider";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <RoomProvider>
            <LocalProvider>
                <ChatProvider>
                    <App/>
                </ChatProvider>
            </LocalProvider>
        </RoomProvider>
    </BrowserRouter>
);
