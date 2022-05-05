const express = require('express');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const Dclient = require('../middleware/DBot');
const { MessageEmbed } = require('discord.js');
require('dotenv').config()

route.put('/', verifyToken, (req,res) => {
    const ticket = req.body.ticket;
    const user = req.author;

    try{
        sendSMS(ticket,user);
        res.json({ticket})
    }
    catch(err){
        res.status(400).json({
            err
        })
    };
})

async function sendSMS (ticket,user){
    const {pr, vpdc, project, details, checks, version, projectColor,id} = ticket
    
    const plural = checks > 1 ? 'Reviewers: ' : 'Reviewer: ';

    const exampleEmbed = new MessageEmbed()
	.setColor(projectColor)
	.setTitle(`Project ${project}`)
	.setAuthor({ name: `${user.name} #${id}`, iconURL: user.img})
	.setDescription(details)
	.setThumbnail(user.img)
	.addFields(
		{ name: 'Pull Request: ', value: pr },
        { name: 'Jira: ', value: vpdc },
		{ name: 'checks: ', value: `0/${checks.toString()}`, inline: true},
	)
    .addField(plural, '*', true)
	.setTimestamp()
    .setFooter({ text: `TicketBuilder v${version}` });

    Dclient.channels.cache.get(process.env.DCHANNELID).send({embeds: [exampleEmbed]});
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
    Dclient.channels.cache.get(msg.channelId).messages.fetch({limit: 100}).then( res => {
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