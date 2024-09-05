const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const startDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
  }
}

startDbAndServer()

//API1
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    select * from player_details`

  const snakeToCamel = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    }
  }

  const dbResponse = await db.all(getPlayersQuery)
  response.send(dbResponse.map(each => snakeToCamel(each)))
})

//API2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    select * from player_details
    where player_id = ${playerId}
    `

  const snakeToCamel = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    }
  }

  const dbResponse = await db.get(getPlayerQuery)
  response.send(snakeToCamel(dbResponse))
})

//API3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  console.log(playerName)
  const updatePlayerQuery = `
        update player_details
        set player_name = "${playerName}"
        where player_id = ${playerId};
    `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `
    select * from match_details
    where match_id = ${matchId}
    `

  const snakeToCamel = player => {
    return {
      matchId: player.match_id,
      match: player.match,
      year: player.year,
    }
  }

  const dbResponse = await db.get(getMatchQuery)
  response.send(snakeToCamel(dbResponse))
})

//API5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getmatchesQuery = `
    select * from match_details
    inner join player_match_score on match_details.match_id=player_match_score.match_id 
    where player_id = ${playerId};
    `

  const snakeToCamel = player => {
    return {
      matchId: player.match_id,
      match: player.match,
      year: player.year,
    }
  }

  const dbResponse = await db.all(getmatchesQuery)
  //response.send(dbResponse)
  response.send(dbResponse.map(each => snakeToCamel(each)))
})

//API6 !
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getmatchesQuery = `
    select * from player_match_score
    natural join player_details
    where match_id = ${matchId}
    `

  const snakeToCamel = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    }
  }

  const dbResponse = await db.all(getmatchesQuery)
  //response.send(dbResponse)
  response.send(dbResponse.map(each => snakeToCamel(each)))
})

//API7 !
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getStatQuery = `
    select player_name,sum(score) as score,sum(fours) as fours,sum(sixes) as sixes from player_match_score 
    inner join player_details on player_match_score.player_id=player_details.player_id
    where player_details.player_id = ${playerId};
    `

  const snakeToCamel = player => {
    return {
      playerId: parseInt(playerId),
      playerName: player.player_name,
      totalScore: player.score,
      totalFours: player.fours,
      totalSixes: player.sixes,
    }
  }

  const dbResponse = await db.get(getStatQuery)
  //response.send(dbResponse)
  response.send(snakeToCamel(dbResponse))
})

app.get('/player_match_score/', async (request, response) => {
  const getPlayersQuery = `
    select * from player_match_score`

  const dbResponse = await db.all(getPlayersQuery)
  response.send(dbResponse)
})

module.exports = app
