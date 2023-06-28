import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

type Player = {
    id: number,
    name: string,
    score: number
}
export const Leaderboard = ({ socket }: any) => {
    const [leaderboard, setLeaderboard] = useState<Player[]>([])
    const fetchLeaderboard = () =>
        fetch('http://localhost:80/leaderboard')
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(error => console.error('Error fetching leaderboard:', error))

    useEffect(() => {
        if (!socket) {
            setInterval(fetchLeaderboard, 1000)
            return
        }
        // // Listen for leaderboard data updates
        socket.on('connect', () => {
            console.log('connected to backend')
        })
        socket.on('leaderboard', (data: Player[]) => {
            setLeaderboard(data)
        })
    }, [socket])
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leaderboard.map((player, index) => (
                        <TableRow key={index + 1}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{player.name}</TableCell>
                            <TableCell>{player.score}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
