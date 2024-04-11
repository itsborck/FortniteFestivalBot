const { EmbedBuilder } = require('discord.js')
const axios = require('axios')
const fs = require('fs')
const { channelId } = require('../../../config.json')

function generateDifficultyBar(difficulty) {
  const filledSquare = '▰'
  const emptySquare = '▱'
  return (
    filledSquare.repeat(difficulty + 1) + emptySquare.repeat(6 - difficulty)
  )
}

async function checkNewTracks(client) {
  const response = await axios.get(
    'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game/spark-tracks?lang=en',
  )
  const data = response.data
  const currentTrackList = Object.values(data).filter(track => track.track)

  let lastTrackList
  try {
    lastTrackList = fs.readFileSync('tracks.txt', 'utf-8').split('\n')
  } catch (err) {
    lastTrackList = []
  }

  const newTracks = currentTrackList.filter(
    track => !lastTrackList.includes(track.track.tt),
  )
  if (newTracks.length > 0) {
    const channel = client.channels.cache.get(channelId)
    await sendNewTracks(newTracks, channel)
  }

  fs.writeFileSync(
    'tracks.txt',
    currentTrackList.map(track => track.track.tt).join('\n'),
  )
  setTimeout(() => checkNewTracks(client), 10000)
}

async function sendNewTracks(newTracks, channel) {
  for (const track of newTracks) {
    const embed = new EmbedBuilder()
      .setTitle('New Track Detected')
      .setDescription(
        `🎶 ${track.track.tt} (${track.track.ry}) | ${track.track.an}
        ⌛ Duration: ${String(
          `${Math.floor(track.track.dn / 60)}:${(
            '0' +
            (track.track.dn % 60)
          ).slice(-2)}`,
        )}
        🎚️ Difficulty Chart:
        Lead: ${generateDifficultyBar(track.track.in.gr)}
        Drums: ${generateDifficultyBar(track.track.in.ds)}
        Vocals: ${generateDifficultyBar(track.track.in.vl)}
        Bass: ${generateDifficultyBar(track.track.in.ba)}`
      )
      .setImage(track.track.au)
      .setFooter({ text: 'Made with ❤️ by borck' })
    await channel.send({ embeds: [embed] })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

module.exports = client => {
  client.on('ready', () => checkNewTracks(client))
}
