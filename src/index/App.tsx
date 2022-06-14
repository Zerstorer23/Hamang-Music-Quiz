import React, {Fragment, useEffect} from 'react';
import Lobby from "pages/lobby/Lobby";
import {Redirect, Route, Switch} from "react-router-dom";
import DataLoader from "pages/components/ui/DataLoader/DataLoader";
import LoadingPage from "pages/components/ui/LoadingPage/LoadingPage";
import {connect} from "pages/components/ui/ChatModule/ChatRelay";
import InGame from "pages/ingame/InGame";
import ChatLoader from "pages/components/ui/ChatModule/ChatLoader";
import GameOverPage from "pages/gameOver/GameOverPage";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";

export enum Navigation {
    Loading = "/loading",
    Lobby = "/",
    InGame = "/game",
    GameFinish = "/finished",
}

function App() {
    useEffect(() => {
        connect();
        MusicManager.loadFile();
    }, []);
    return (
        <Fragment>
            <DataLoader/>
            <ChatLoader/>
            <Switch>
                <Route path={Navigation.Loading} exact>
                    <LoadingPage/>
                </Route>
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
        </Fragment>
    );
}

export default App;
