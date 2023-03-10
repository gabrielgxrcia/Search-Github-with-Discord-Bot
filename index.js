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

async function getInfoUserGithub(message, params) {
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

function codeBlockJs(macaco) {
  return `\`\`\`js\n${macaco}\n\`\`\``
}

async function handleInfoCommand(message) {
  const messageParts = message.content.split(' ')
  const command = messageParts[0]
  const username = messageParts[1]

  if (!command.endsWith('-info')) return

  if (!username) {
    return message.reply(
      'Não consigo buscar se você não escrever o nome do usuário.'
    )
  }

  const githubUser = await getInfoUserGithub(message, username)

  const profileInformation = `{\n\tNomeDeUsuario: '${githubUser.login}'\n\tNomeCompleto: '${githubUser.name}'\n\tLocalizacao: '${githubUser.location}'\n\tRepositorios: ${githubUser.public_repos}\n\tSeguidores: ${githubUser.followers}\n\tSeguindo: ${githubUser.following}\n\tAtividadedeCommits: '${githubUser.commit_activity}' \n}`

  message.channel.send({
    files: [
      {
        attachment: githubUser.avatar_url,
        name: `${githubUser.login}.jpg`,
      },
    ],
  })

  message.reply(codeBlockJs(profileInformation))
}

async function handleRepoCommand(message) {
  const messageParts = message.content.split(' ')
  const command = messageParts[0]
  const username = messageParts[1]

  if (!command.endsWith('-repo')) return

  if (!username) {
    return message.reply(
      'Não consigo buscar se você não escrever o nome do usuário.'
    )
  }
  const userRepo = await getInfoUserGithub(message, `${username}/repos`)

  // [] fazer verificação se usuário existe

  const list = userRepo.map(repo => ({
    name: repo.name,
    html_url: repo.html_url,
  }))

  const info = list
    .map(
      item =>
        `\t{\n\t\tname: "${item.name}"\n\t\thtml_url: "${item.html_url}"\n\t}`
    )
    .join(',\n')

  message.channel.send(`Os repositórios são: \`\`\`js
const infoRepositorio = \n[\n${info}\n];
    \`\`\``)
}

client.on('messageCreated', () => {
  const command = message.content.split(' ')[0]

  if (!allowedCommands.includes(command)) {
    return message.reply(
      'A mensagem não está no formato correto. Por favor, tente alguns desses comando: \n' +
        allowedCommands
          .map(allowedCommand => allowedCommand.split(',')[0])
          .join(', ')
    )
  }
})

client.on('messageCreate', message => {
  if (message.author.bot || message.channel.id !== '1071482066073559120') return

  handleInfoCommand(message)
  handleRepoCommand(message)
})

client.login(process.env.TOKEN)
