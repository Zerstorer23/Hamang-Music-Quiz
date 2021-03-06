import React, {Fragment, useEffect} from 'react';
import Lobby from "pages/lobby/Lobby";
import {Redirect, Route, Switch} from "react-router-dom";
import DataLoader from "pages/components/ui/DataLoader/DataLoader";
import {connect} from "pages/components/ui/ChatModule/system/ChatRelay";
import InGame from "pages/ingame/InGame";
import ChatLoader from "pages/components/ui/ChatModule/system/ChatLoader";
import GameOverPage from "pages/gameOver/GameOverPage";
import ConsoleGuard from "pages/components/ui/VideoGuard/ConsoleGuard";

export enum Navigation {
    Loading = "/loading",
    Lobby = "/",
    InGame = "/game",
    GameFinish = "/finished",
}

function App() {
    useEffect(() => {
        connect();
    }, []);
    return (
        <Fragment>
            <DataLoader>
                <ConsoleGuard/>
                <ChatLoader/>
                <Switch>
                    <Route path={Navigation.Lobby} exact>
                        <Lobby/>
                    </Route>
                    <Route path={Navigation.InGame} exact>
                        <InGame/>
                    </Route>
                    <Route path={Navigation.GameFinish} exact>
                        <GameOverPage/>
                    </Route>
                    <Route path="*">
                        <Redirect to={Navigation.Loading}/>
                    </Route>
                </Switch>
            </DataLoader>
        </Fragment>
    );
}

export default App;
