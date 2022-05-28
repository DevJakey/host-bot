const Discord = require('discord.js');
const chalk = require('chalk')
const config = require('../config.json')
const fs = require('fs')
const { default: axios } = require('axios')
const exec = require('child_process').exec;
let idkwhatisthis = false
module.exports = async (client) => {
    console.log(chalk.hex('#6b7dfb')(`Luxxy Hosting`))
    console.log(`Logged in as: ${chalk.underline(client.user.tag)}`)
    console.log(`Save Console: ${config.settings.consoleSave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Node Status: ${config.settings.nodeStatus ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Maintenance mode: ${config.settings.maintenance ? chalk.green('true ') : chalk.red('false')}`)
    console.log(`Auto Leave Guilds: ${config.settings.autoLeave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Minecraft Port Checker: ${config.settings.McScript ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Lavalink Stats: ${config.settings.lavalinkStatus ? chalk.green('true') : chalk.red('false')}`)
    console.log()

    const autorun = fs.readdirSync(`./autoRun`).filter(file => file.endsWith('.js'));
    autorun.forEach(file => {
        require(`../autoRun/${file}`)(client)
    });


    if(config.settings.updateFromGithub){
        setInterval(async () => {
            await exec(`git pull origin master`, async (error, stdout) => {
                let response = (error || stdout);
                if (!error) {
                    if (!response.includes("Already up to date.")){
                        console.log(`${chalk.red('[ GitHub ]')} Update found on github. downloading now!`);
                        await client.channels.cache.get(config.channelID.github).send({content: "**RESTARTING . . .**", embeds:[
                            new Discord.MessageEmbed()
                            .setTitle(`**[PULL FROM GITHUB]** New update on GitHub. Pulling.`)
                            .setColor(`BLUE`)
                            .setDescription(`Logs:\n\`\`\`\n${response}\`\`\``)
                        ]})
                        console.log(`${chalk.red('[ GitHub ]')} the new version had been installed. Restarting now . . .`)
                        process.exit()
                    }else {
                        if(!idkwhatisthis) {console.log(`${chalk.green('[ GitHub ]')} Bot is up to date\n`); idkwhatisthis = true}
                    }
                }else{
                    console.log(`${chalk.red('[ GitHub ]')} Error: ${error}\n`)
                }
            })
        }, 30000)
    }

    const clientactivity = [
        `!help | Luxxy Hosting`,
        `i'm nothing but a bot`,
        `i'm a bot`,
        `what`,
        `message.reply('help')`
    ]
    setInterval(() => {
        client.user.setActivity(clientactivity[Math.floor(Math.random() * clientactivity.length)], { type: "WATCHING" })
    }, 10000)
    setInterval(() => {
        let guild = client.guilds.cache.get(config.settings.guildID);
        let membercount3 = guild.members.cache.size.toLocaleString();
        client.channels.cache.get(config.voiceID.members).edit({ 
            name: `Total Members: ${membercount3}`
        })

        axios({
            url: config.pterodactyl.host + "/api/application/servers",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.servers).edit({ 
                name: `Total Servers: ${response.data.meta.pagination.total.toLocaleString()} Servers`
            })
        })

        axios({
            url: config.pterodactyl.host + "/api/application/users",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.clients).edit({ 
                name: `Total Users: ${response.data.meta.pagination.total.toLocaleString()} Users`
            })
        })    
        console.log('voice channels updated')    
    }, 60000);

    if(config.settings.autoLeave) client.guilds.cache.forEach(g => {
        if(g.id === config.settings.guildID) return
        g.leave().catch(console.error)
    })
    
    if(config.settings.lavalinkStatus){
        const channel = await client.channels.fetch(config.channelID.lavalinkStats);
        const embed = new Discord.MessageEmbed()
          .setColor("#2F3136")
          .setDescription("Fetching Stats From Lavalink");
        channel.bulkDelete(1);
        channel.send({ embeds: [embed] }).then((msg) => {
            setInterval(() => {
                let all = [];
                
                client.manager.nodes.forEach((node) => {
                    let color;
                    
                    if (!node.connected) color = "-";
                    else color = "+";
                    
                    let info = [];
                    info.push(`${color} Node          :: ${node.options.identifier}`);
                    info.push(`${color} Status        :: ${node.connected ? "Connected [🟢]" : "Disconnected [🔴]"}`);
                    info.push(`${color} Player        :: ${node.stats.players}`);
                    info.push(`${color} Used Player   :: ${node.stats.playingPlayers}`);
                    info.push(`${color} Uptime        :: ${moment.duration(node.stats.uptime).format(" d [days], h [hours], m [minutes], s [seconds]")}`);
                    info.push(`${color} Cores         :: ${node.stats.cpu.cores} Core(s)`);
                    info.push(`${color} Memory Usage  :: ${prettyBytes(node.stats.memory.used)}/${prettyBytes(node.stats.memory.reservable)}`);
                    info.push(`${color} System Load   :: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%`);
                    info.push(`${color} Lavalink Load :: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`);
                    all.push(info.join("\n"));});
                
                const rembed = new Discord.MessageEmbed()
                  .setColor("#2F3136")
                  .setAuthor({
                      name: `Lavalink Status`,
                      iconURL: client.user.displayAvatarURL({ forceStatic: false }),
                  })
                  .setDescription(`\`\`\`diff\n${all.join("\n\n")}\`\`\``)
                  .setFooter({
                text: "Last Update",
            })
            .setTimestamp(Date.now());
                  }, 60000);
                })};
    
    client.manager.init(client.user.id);
}
