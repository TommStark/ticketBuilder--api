const express = require('express');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const Dclient = require('../middleware/DBot');
const { MessageEmbed } = require('discord.js');
const project = require('./project')

require('dotenv').config()

route.put('/', verifyToken, (req,res) => {
    const ticket = req.body.ticket;
    const author = req.author;

    try{
        sendSMS(ticket,author);
        res.json({"ok":200})
    }
    catch(err){
        res.status(400).json({
            err
        })
    };
})

route.post('/push/project',verifyToken, (req,res) => {
    const text = req.body.text;
    try{
        sendmessageToChanell(text);
        res.json({"ok":200})
    }
    catch(err){
        res.status(400).json({
            err
        })
    };
})

route.post('/scan/channel',verifyToken, (req,res) => {
    try{
        scanChannel();
        res.json({"ok":200})
    }
    catch(err){
        res.status(400).json({
            err
        })
    };
})


async function scanChannel(){
    let atLeastOne = false;

    Dclient.channels.cache.get(process.env.DCHANNELID).messages.fetch({limit: 100}).then( res => {
        res.map(msn => {
            if(msn.author.bot && msn.embeds[0] != undefined ){
                if(msn.embeds[0]?.thumbnail?.url != 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yes_Check_Circle.svg/2048px-Yes_Check_Circle.svg.png'
                && msn.embeds[0]?.thumbnail?.url != 'https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057'){
                    atLeastOne = true;
                    msn.reply({
                        content: '@here Friendly reminder Team :rainbow: !'
                    })
                }
            }
        })
        if(!atLeastOne){
            Dclient.channels.cache.get(process.env.DCHANNELID).send('Congratulations team all! We are up to date. Here is a cookie 🍪');
        } 
    }); 
}

async function sendSMS (ticket,author){
    const {prLink, ticketLink, project, details, checks, version, projectColor,id} = ticket
    let user;
    
    if(ticket.user){
        user = ticket.user;
    }else{
        user = author;
    }
    
    const plural = checks > 1 ? 'Reviewers: ' : 'Reviewer: ';

    const exampleEmbed = new MessageEmbed()
	.setColor(projectColor)
	.setTitle(`Project ${project}`)
	.setAuthor({ name: `${user.name} #${id}`, iconURL: user.img})
	.setDescription(details)
	.setThumbnail(user.img)
	.addFields(
		{ name: 'Pull Request: ', value: prLink },
        { name: 'Jira: ', value: ticketLink },
		{ name: 'checks: ', value: `0/${checks.toString()}`, inline: true},
	)
    .addField(plural, '*', true)
	.setTimestamp()
    .setFooter({ text: `TicketBuilder v${version}` });

    Dclient.channels.cache.get(process.env.DCHANNELID).send({embeds: [exampleEmbed]});
}

async function sendmessageToChanell(text){
    try{
        const projects = await project.getAllprojects();

        const exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Project Status`)
        .setAuthor({ name: 'Roberto says', iconURL: 'https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057'})
        .setDescription(text)
        .setThumbnail('https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057')
        .setTimestamp()

        projects.forEach(pro => {
            exampleEmbed.addFields({
                name:pro.name, value:pro.state ?  '✅' :  '❌'
            }
            );
        });

        Dclient.channels.cache.get(process.env.DCCHANNELID_STATS).send({embeds: [exampleEmbed]});
    }catch(err){
        console.log('not possible to send message to channel')
    }
}


function ticketHelp(msg){
        msg.reply({
            content:`
            Emoji commands:\n
            👀 : Assigns you as reviewer (the checks field determines the maximum).\n
            ✅ : Add a new check to the ticket.\n
            ⚛️  : Change the ticket to merged (modify the image).\n
            ❌ : Removes the ticket (3 reactions are needed).\n
            `
        })
    }

async function ticketStats (msg, project){
    const projects = await project.getAllprojects();

    const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle(`Project Status`)
	.setAuthor({ name: 'Roberto says', iconURL: 'https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057'})
	.setDescription('Which project is available to merge?')
	.setThumbnail('https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057')
	.setTimestamp()

    projects.forEach(pro => {
        exampleEmbed.addFields({
            name:pro.name, value:pro.state ?  '✅' :  '❌'
        }
        );
    });

    msg.reply({embeds: [exampleEmbed]})
}

function ticketLazy(msg){
    Dclient.channels.cache.get(msg.channelId).messages.fetch({limit: 50}).then( res => {
        res.map(msn => {
            if(msn.author.bot && msn.embeds[0] != undefined && msg.content === '/roberto-lazy'){
                if(msn.embeds[0]?.thumbnail?.url != 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yes_Check_Circle.svg/2048px-Yes_Check_Circle.svg.png'
                && msn.embeds[0]?.thumbnail?.url != 'https://static.wikia.nocookie.net/esfuturama/images/9/9b/Roberto.png/revision/latest?cb=20130123221057'){
                    msn.reply({
                        content: '@here Friendly reminder Team :rainbow: !'
                    })
                }
            }
        })
    });  
}

module.exports = {
    route,
    ticketHelp,
    ticketStats,
    ticketLazy
}