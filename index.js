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

const allowedCommands = ['!teste-repo', '!teste-info']

client.on('ready', () => {
  console.log('O bot está no ar!')
})

client.on('messageCreate', message => {
  //Evento que é efetuado sempre que uma mensagem é enviada ao servidor.
  if (message.author.bot) return //Verifica se a mensagem é enviada por um bot ou usuário, caso for bot, a função é interrompida.

  const messageVerify = message.content.split(' ')[0].split('-')[1] === 'info'

  if (messageVerify) {
    //Verifica se a mensagem é "!github".

    const args = message.content.split(' ') //Divide a mensagem em argumentos separados por espaço.

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

async function getInfoUserGithub(params) {
  try {
    const response = await axios.get(`https://api.github.com/users/${params}`)

    if (response.status === 200) {
      return response.data
    } else {
      throw new Error(
        `Erro ao buscar informações sobre o usuário "${params}" (código de erro: ${response.status})`
      )
    }
  } catch (error) {
    return message.reply(
      `Não foi possível encontrar informações sobre o usuário "${params}": ${error.message}`
    )
  }
}

client.on('messageCreate', async message => {
  if (message.author.bot) return

  const messageVerify = message.content.split(' ')[0]
  const user = message.content.split(' ')[1]

  if (!allowedCommands.includes(messageVerify)) {
    return message.reply(
      'A mensagem não está no formato correto. Por favor, tente alguns desses comando: \n' +
        allowedCommands
          .map(allowedCommand => allowedCommand.split(',')[0])
          .join(', ')
    )
  }

  if (!user) {
    return message.reply(
      'Não consigo buscar se você não escrever o nome do usuário.'
    )
  }

  const userRepo = await getInfoUserGithub(`${user}/repos`)

  if (userRepo.length === 0) {
    return message.reply(
      `Não foram encontrados repositórios para o usuário "${user}".`
    )
  }

  message.reply(
    `Repositórios encontrados para o usuário "${user}": ${userRepo.map(
      event => '\n\n' + event.name
    )}`
  )
})

client.login(process.env.TOKEN) // Faz o login do bot com o token dentro de .env
