require('dotenv').config()
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const axios = require('axios')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.User,
    Partials.Channel,
  ],
})

client.on('ready', () => {
  console.log('O bot está no ar!')
})

client.on('messageCreate', message => {
  if (message.author.bot) return

  if (message.content.startsWith('!github')) {
    const args = message.content.split(' ')
    if (args.length < 2) {
      message.reply(
        'Por favor, forneça um nome de usuário do GitHub após o comando !github'
      )
      return
    }
    const user = args[1]
    axios
      .get(`https://api.github.com/users/${user}`)
      .then(response => {
        const githubUser = response.data
        message.reply(
          `Nome de usuário: ${githubUser.login}\nNome completo: ${githubUser.name}\nLocalização: ${githubUser.location}\nRepositórios: ${githubUser.public_repos}\nSeguidores: ${githubUser.followers}\nSeguindo: ${githubUser.following}`
        )
      })
      .catch(error => {
        console.error(error)
        message.reply(
          `Não foi possível encontrar informações sobre o usuário "${user}"`
        )
      })
  }
  if (message.content.startsWith('!repos')) {
    const args = message.content.split(' ')
    if (args.length < 2) {
      message.reply(
        'Por favor, forneça um nome de usuário do GitHub após o comando !repos'
      )
      return
    }
    const user = args[1]
    axios
      .get(`https://api.github.com/users/${user}/repos`)
      .then(response => {
        const githubRepos = response.data
        let reposInfo = ''
        githubRepos.map(repo => {
          reposInfo += `Nome: ${repo.name}\nURL: ${repo.html_url}\n\n`
        })
        message.reply(
          `Informações dos repositórios do usuário ${user}:\n\n${reposInfo}`
        )
      })
      .catch(error => {
        console.error(error)
        message.reply(
          `Não foi possível encontrar repositórios do usuário "${user}"`
        )
      })
  }
})

client.login(process.env.TOKEN)
