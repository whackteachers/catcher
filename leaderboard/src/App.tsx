import React from 'react'
import { Leaderboard } from "./Leaderboard"
import { Box } from "@mui/material"
import { io } from "socket.io-client"
const socket = io('http://localhost:80')

const container = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5%',
    width: '50%',
    margin: '0 auto'
}

function App() {
    return (
        <Box sx={{ ...container }}>
          <h1>Catch Game Leaderboard</h1>
          <Leaderboard socket={socket}/>
        </Box>
    );
}

export default App;
