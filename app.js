const ticket = require('./routes/ticket');
const author = require('./routes/author')
const auth = require('./routes/auth')
const project = require('./routes/project')
const discBot = require('./routes/discBot')
const express = require('express');
const news = require('./routes/news');
const post = require('./routes/post');
const mongoose = require('mongoose');
const cors = require('cors');
const Dclient = require('./middleware/DBot');
const port = process.env.PORT || '8080';
const { MessageEmbed } = require('discord.js');

require('dotenv').config()


const DBUrl = process.env.mongo_db || 'mongodb://localhost:27017/arz';


// DB connection
main()
.then (console.log('DB connected... ',DBUrl))
.catch(err => console.log(err));
async function main() {
    await mongoose.connect(DBUrl);
};

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(cors({
    origin: '*'
}));

Dclient.on("ready", () => {
    console.log(`logged in as ${Dclient.user.tag}`);
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/auth',auth);
app.use('/api/ticket',ticket.route);
app.use('/api/author',author);
app.use('/api/project',project.route);
app.use('/api/discBot',discBot.route);
app.use('/api/news',news.route);
app.use('/api/posts',post);


Dclient.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
    Dclient.channels.cache.get(reaction.message.channelId).messages.fetch(reaction.message.id)
        .then(msg =>{
            try{
                const receivedEmbed = msg.embeds[0];
                const ticketId = (receivedEmbed.author.name).split('#')[1]; 
                const Authors = (receivedEmbed?.fields[3]?.value)?.split(',');
                const checks = parseInt((receivedEmbed.fields[2].value).split('/')[1]);

                if(reaction.emoji.name === '👀'){
                    if( (Authors[0] === '*' && Authors.length <= 1) || (Authors[0] !== '*' && Authors.length < checks)){
                        if(receivedEmbed.fields[3].value === '*') { 
                            receivedEmbed.fields[3].value = user.username;
                        } else {
                            receivedEmbed.fields[3].value = `${receivedEmbed.fields[3].value},${user.username}`;
                        }
                        const exampleEmbed = new MessageEmbed(receivedEmbed);
                        ticket.pushReviewer(ticketId,user.username)
                        msg.edit({ embeds: [exampleEmbed] });
                    }
                }

                if(reaction.emoji.name === '❌' && reaction.count === 2){
                    msg.delete();
                }

                if(reaction.emoji.name === '✅' && reaction.count <= checks){
                    const checkSplit = (receivedEmbed.fields[2].value).split('/')
                    const checkCount = parseInt(checkSplit[0])+1;
                    receivedEmbed.fields[2].value =`${checkCount}/${checkSplit[1]}`
                    const exampleEmbed = new MessageEmbed(receivedEmbed);
                    msg.edit({ embeds: [exampleEmbed] });
                }


                if(reaction.emoji.name === '⚛️'){
                    ticket.updateTicketDateAndStatus(ticketId,true,new Date());
                    const exampleEmbed = new MessageEmbed(receivedEmbed).setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yes_Check_Circle.svg/2048px-Yes_Check_Circle.svg.png')
                    msg.edit({ embeds: [exampleEmbed] });
                }

                if(reaction.emoji.name === '❤️‍🔥'){
                    msg.delete();
                }
            }
            catch{
                console.log('failed to manage add emojis, not embed msg')
            }
        });
})

Dclient.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
    Dclient.channels.cache.get(reaction.message.channelId).messages.fetch(reaction.message.id)
    .then(msg =>{
        try{
        const receivedEmbed = msg.embeds[0];
        const ticketId = (receivedEmbed.author.name).split('#')[1]; 

        if(reaction.emoji.name === '👀'){
            const newReviewers = (receivedEmbed.fields[3].value).split(',').filter(name => name !== `${user.username}`).join(',');
            receivedEmbed.fields[3].value = !!newReviewers ? newReviewers : '*' ;
            ticket.pullReviewer(ticketId,user.username)
            const exampleEmbed = new MessageEmbed(receivedEmbed);
            msg.edit({ embeds: [exampleEmbed] });
        }

        if(reaction.emoji.name === '✅'){
            const checkSplit = (receivedEmbed.fields[2].value).split('/')
            const checkCount = parseInt(checkSplit[0])-1;
            receivedEmbed.fields[2].value =`${checkCount}/${checkSplit[1]}`
            const exampleEmbed = new MessageEmbed(receivedEmbed);
            msg.edit({ embeds: [exampleEmbed] });
        }

        if(reaction.emoji.name === '⚛️' && reaction.count === 0){
            ticket.updateTicketDateAndStatus(ticketId,false, null);
            const exampleEmbed = new MessageEmbed(receivedEmbed).setThumbnail(receivedEmbed.author.iconURL)
            msg.edit({ embeds: [exampleEmbed] });
        }
    }catch{
        console.log('failed to manage remove emojis, not embed msg')
        }
    })
})

Dclient.on('messageCreate', async (msg) => {    

    //TODO create object literal
    
    if(msg.content === '/roberto-help'){
        discBot.ticketHelp(msg);
    }
    if(msg.content === '/roberto-lazy'){
        discBot.ticketLazy(msg)
    }
    if(msg.content === '/roberto-status'){
        discBot.ticketStats(msg, project);
    }

})

app.listen(port, () => { console.log ("API OK, running:", port)});

