const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Function to handle incoming messages (other than /start)
const axios = require('axios');


// MongoDB connection setup
const mongoUri = "mongodb+srv://daxonultra:uoOqliQL1OADuQ2P@cluster0.egnde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// MongoDB schema and model for users

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: String,
  initialJoinDate: Date,
  lastJoinDate: Date,
  referralLink: String,
  referralsCount: { type: Number, default: 0 },
  referredBy: Number,
  watchLinksCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  deletedAt: { type: Date },
  token: { type: String, default: '' },
  tokenExpires: { type: Date },
  canUseCommandUntil: { type: Date },
  isVerified: { type: Boolean, default: false },
  progress: {
    parody: { lastSentVideo: String },
    viral: { lastSentVideo: String },
    webs: { lastSentVideo: String },
    fvideo: { lastSentVideo: String }
  }
});

const User = mongoose.model('User', userSchema);

const fileSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
  category: { type: String, required: true }
});

const FileModel = mongoose.model('File', fileSchema);

const puserSchema = new mongoose.Schema({
  puserId: { type: String, unique: true },
  firstName: { type: String },  // Adding first name field
  username: { type: String },
});


const P_USERS = mongoose.model('PUser', puserSchema);
const ppuserSchema = new mongoose.Schema({
  puserId: { type: String, unique: true },
  firstName: { type: String },
  username: { type: String },
  demoUsed: { type: Number, default: 0 }, // 0 for false, 1 for true
  demoStartTime: { type: Date }
});

const PP_USERS = mongoose.model('PPUser', ppuserSchema);

const parodySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
});

const viralSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
});

const websSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
});

const fvideoSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
});

const Parody = mongoose.model('Parody', parodySchema);
const Viral = mongoose.model('Viral', viralSchema);
const Webs = mongoose.model('Webs', websSchema);
const Fvideo = mongoose.model('Fvideo', fvideoSchema);

// Set the required channel username
const REQUIRED_CHANNEL = '@Hivabyte'; // Your channel

// Helper function to check if the user is the owner

// Replace with your own Telegram bot token
const app = express();
const token = '7450765421:AAFdNQrxPoH5jzD9xEID2-xC7YXPHbbPoXE';
const TOKEN = '7450765421:AAFdNQrxPoH5jzD9xEID2-xC7YXPHbbPoXE';
const ownerId = 6713397633;
const OWNER_ID = 6713397633;
const channelId = '-1002044705664';
const logchannelId = '-1002274317757';
const GroupLink = 'https://t.me/hivajoymovie';
const UpdateChannelLink = 'https://t.me/Hivabyte';
// Create a bot instance
const bot = new TelegramBot(token, { polling: true });
const isOwner = (userId) => {
  return userId === OWNER_ID;
};
// Variable to store bot's username
let botUsername = '';

// Fetch the bot's username asynchronously to ensure it's set before use
bot.getMe().then((botInfo) => {
  botUsername = botInfo.username;  // Set the bot's username after fetching it
  console.log(`Bot username is: ${botUsername}`);
});







// Add PUser Command
bot.onText(/\/addpuser (\d+)/, async (msg, match) => {
  const userId = match[1]; // Extract userId from the message
  const chatId = msg.chat.id;

  if (chatId.toString() == OWNER_ID) {
    try {
      // Check if user already exists
      const existingUser = await P_USERS.findOne({ puserId: userId });
      if (existingUser) {
        return bot.sendMessage(chatId, `User with ID ${userId} is already added.`);
      }

      // Fetch the user details (first name) using the userId
      const user = await bot.getChat(userId); // Get user info by their ID

      // Add the new user to MongoDB with the fetched first name
      const newPUser = new P_USERS({ puserId: userId, firstName: user.first_name });
      await newPUser.save();

      bot.sendMessage(chatId, `User with ID ${userId} has been added.`);
      bot.sendMessage(userId, 
  '*🎉 Congratulations! 🎉*\n\nYou have been **promoted to a Premium User**! 🎉\n\nNow, you can easily access **Premium Content** directly! 🚀💎\n\nSend /getvideo 😎✨', 
  {parse_mode: 'Markdown'}
);

      
       const userToDelete = await PP_USERS.findOne({ puserId: userId });

    if (!userToDelete) {
      return bot.sendMessage(chatId, `User with ID ${userId} not found in the database.`);
    }

    // Delete the user from MongoDB
    await PP_USERS.deleteOne({ puserId: userId });

    bot.sendMessage(chatId, `User with ID ${userId} has been removed. From PPuser`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while adding the user.');
    }
  }
});


// Remove PUser Command
bot.onText(/\/delpuser (\d+)/, async (msg, match) => {
  const userId = match[1]; // Extract userId from the message
  const chatId = msg.chat.id;

if (chatId.toString() == OWNER_ID) {
 try {
    // Find the user to delete
    const userToDelete = await P_USERS.findOne({ puserId: userId });

    if (!userToDelete) {
      return bot.sendMessage(chatId, `User with ID ${userId} not found in the database.`);
    }

    // Delete the user from MongoDB
    await P_USERS.deleteOne({ puserId: userId });

    bot.sendMessage(chatId, `User with ID ${userId} has been removed. from Puser`);
    bot.sendMessage(userId, 
  '***⏳ Oops! Your plan has expired***\n\n✨ Renew to the ***Premium Users Plan*** \n',
  {parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💳 View Premium Plan', callback_data: 'buyprime' }
        ]
      ]
    }
  }
);
   
   const existingUser = await PP_USERS.findOne({ puserId: userId });
      if (existingUser) {
        return bot.sendMessage(chatId, `User with ID ${userId} is already added.`);
      }

      // Fetch the user details (first name) using the userId
      const user = await bot.getChat(userId); // Get user info by their ID

      // Add the new user to MongoDB with the fetched first name
      const newPPUser = new PP_USERS({ puserId: userId, firstName: user.first_name, demoUsed:1 });
      await newPPUser.save();

      bot.sendMessage(chatId, `User with ID ${userId} has been added. in PPuser`);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'There was an error while deleting the user.');
  }
}
});


// View All PUsers Command
bot.onText(/\/pusers/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the sender is the owner
  if (chatId.toString() == OWNER_ID) {

    try {
      // Fetch all PUsers from the database
      const allPUsers = await P_USERS.find();

      if (allPUsers.length === 0) {
        return bot.sendMessage(chatId, 'No users found in the database.');
      }

      // Prepare the list of users to display with their first name
      const userList = allPUsers.map(user => {
        return `ID: ${user.puserId}, First Name: ${user.firstName || 'N/A'}`;
      }).join('\n');

      // Send the list of users
      bot.sendMessage(chatId, `List of all Pusers:\n\n${userList}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while fetching the user list.');
    }
  }
});

// View All PUsers Command
bot.onText(/\/ppusers/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the sender is the owner
  if (chatId.toString() == OWNER_ID) {

    try {
      // Fetch all PUsers from the database
      const allPPUsers = await PP_USERS.find();

      if (allPPUsers.length === 0) {
        return bot.sendMessage(chatId, 'No users found in the database.');
      }

      // Prepare the list of users to display with their first name
      const userList = allPPUsers.map(user => {
        return `ID: ${user.puserId}, First Name: ${user.firstName || 'N/A'}`;
      }).join('\n');

      // Send the list of users
      bot.sendMessage(chatId, `List of all PPusers:\n\n${userList}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while fetching the user list.');
    }
  }
});










// Function to generate a random 6-character referral code
function generateRandomReferralCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const verifyToken = async (token) => {
  try {
    const user = await User.findOne({ token });
    if (user && user.tokenExpires > new Date()) {
      return user; // Token is valid and user exists
    }
    return null; // Invalid or expired token
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Function to handle the /start command
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || "No username"; // Get the username, if available
  const referrerCode = match && match[1];  // Extract referrer code or uniqueId
  let uniqueId = referrerCode;  // If the start parameter is provided, it could be a uniqueId or referral code

  try {
    // Check if the user is already in the database
    let user = await User.findOne({ userId: String(chatId) });

    // If user doesn't exist, create a new user
    if (!user) {
      // Generate a random 6-character referral code for new users
      const referralCode = generateRandomReferralCode();  // Use the random string generator
      const referralLink = `https://t.me/${botUsername}?start=reffer_${referralCode}`;  // Generate the referral link

      // Create a new user
      user = new User({
        userId,
        username,
        initialJoinDate: new Date(),
        lastJoinDate: new Date(),
        referralLink, // Set the generated referral link here
        referralsCount: 0,  // Initially 0 referrals
        referredBy: referrerCode ? await getUserIdFromReferral(referrerCode) : null, // Set the referrer if provided
      });

      

      await user.save();  // Save the new user to the database
    } else {
      // Update last join date if user exists
      user.lastJoinDate = new Date();
      await user.save();
    }

    // Case 1: If the uniqueId starts with 'token_', handle token verification
    if (uniqueId && uniqueId.startsWith("token_")) {
      const token = uniqueId.split("token_")[1]; // Extract the token

      // Handle the token verification logic here
      const verifiedUser = await verifyToken(token);
      if (verifiedUser) {
        // Mark user as verified
        verifiedUser.isVerified = true;
        verifiedUser.token = ''; // Remove the token after successful verification
        verifiedUser.tokenExpires = null; // Remove the token expiration
        verifiedUser.canUseCommandUntil = new Date(Date.now() + 5 * 60 * 1000); // User can use the command for 1 minute after verification
        await verifiedUser.save();

        bot.sendMessage(chatId, "✅ Verification successful! You are now verified. Now you can use the command.");
      } else {
        bot.sendMessage(chatId, "❌ Invalid or expired token. Please try again.");
      }
    }
    // Case 2: If the uniqueId starts with 'reffer_', handle referral code logic
    else if (uniqueId && uniqueId.startsWith("reffer_")) {
    const referrerCode = uniqueId.split("reffer_")[1];
    
    if (referrerCode) {
        // Send a welcome message with an image and buttons
        const welcomeMessage = '👋 <b>Welcome to Our Amazing Bot!</b> 🎉\n\n' +
            'Simply send/forward me a Terabox link, and get Direct Watch/Download link instantly! 🌟📥\n\n' +
            'For <b>DIRECT 🔞ADULT VIDEO</b>\nJust type <b>/getvideo</b> and start enjoying in a flash! 🎬✨';

        const welcomeImageUrl = 'https://i.pinimg.com/originals/47/5b/59/475b59c61a6efb3ec8ac0a57e43fd03b.webp'; // Replace with an actual image URL

        const startButtons = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🎬 See Channel',
                        url: 'https://t.me/Hivabyte'
                    }],
                    [{
                        text: '🔗 Share Bot',
                        callback_data: 'share_bot'  // This triggers a callback for sharing
                    }]
                ]
            }
        };

        // Send the welcome message with image and buttons
        await bot.sendPhoto(chatId, welcomeImageUrl, {
            parse_mode: 'HTML',
            caption: welcomeMessage,  // The text message
            reply_markup: startButtons.reply_markup // Attach the buttons here
        });

        // Find the user who clicked on the referral link
        const existingUser = await User.findOne({ chatId });

        if (!existingUser) {
            // If the user is not found, it means they are a new user. Let's create a new user entry.
            const referrer = await User.findOne({ referralLink: `https://t.me/${botUsername}?start=reffer_${referrerCode}` });

            if (referrer) {
                // Increment the referral count only if the user is a new user and not an existing one.
                referrer.referralsCount += 1;
                console.log(`Referrer ${referrer.username} referrals count updated to: ${referrer.referralsCount}`);
                await referrer.save(); // Save the updated referrer
            } else {
                console.log(`No referrer found for referral code: ${referrerCode}`);
            }
} else {
            // If the user already exists, we don't update the referrer count
            console.log(`User ${existingUser.username} already exists. Referrer count will not be updated.`);
        }
    }
}

    // Case 3: If the uniqueId starts with 'file_', handle file request
    else if (uniqueId && uniqueId.startsWith("file_")) {
      const models = [Parody, Viral, Webs, Fvideo];
      const uniqueID = uniqueId.split("file_")[1];

      let file = null;

      for (let model of models) {
        file = await model.findOne({ uniqueId: uniqueID });
        if (file) break; // If a match is found, break the loop
      }

      if (file) {
        // Send the file to the user
        const sentMessage = await bot.sendDocument(chatId, file.fileId, { caption: file.caption });

        // Send a warning message about file deletion
        const warningMessage = '⚠️ This file will be automatically deleted after 10 minutes. Please forward it if needed!';
      } else {
        // If the file doesn't exist, inform the user
        await bot.sendMessage(chatId, 'Sorry, the file could not be found!');
      }
      return;  // Exit early as we're handling the file request here
    }
    // Case 4: General welcome message
    else {
      // Send a welcome message with an image and buttons
      const welcomeMessage = '👋 <b>Welcome to Our Amazing Bot!</b> 🎉\n\n' +
        'Simply Send/Forward me a Terabox Link,\n\nAnd get Direct 👀 Watch | ⬇️ Download link instantly! 🌟📥\n\n';
      
      const aboutMessage = `
<blockquote><b>🎥 Mʏ Nᴀᴍᴇ: <a href='https://t.me/${botUsername}'>Terabox Video Player</a></b></blockquote>
<blockquote><b>👨‍💻 Cʀᴇᴀᴛᴏʀ: <a href='https://t.me/ShivamNox'>@ShivamNox</a></b></blockquote>
<blockquote><b>📚 Lɪʙʀᴀʀʏ: <a href='https://t.me/Hivabyte'>Node</a></b></blockquote>
<blockquote><b>💻 Lᴀɴɢᴜᴀɢᴇ: <a href='https://t.me/Hivabyte'>NodeJS</a></b></blockquote>
<blockquote><b>🗄️ Dᴀᴛᴀʙᴀsᴇ: <a href='https://mongodb.com'>MongoDB</a></b></blockquote>
<blockquote><b>💾 Bᴏᴛ Sᴇʀᴠᴇʀ: <a href='https://shivamnox.rf.gd'>Hivabytes</a></b></blockquote>
<blockquote><b>🔧 Bᴜɪʟᴅ Sᴛᴀᴛᴜs: <a href='https://hivajoy.free.nf'>3.6.7</a></b></blockquote>
`;
const OwnerInfo = `
<b>🌟 Oᴡɴᴇʀ Dᴇᴛᴀɪʟs 🌟</b>

<b>🧑‍💻 Nᴀᴍᴇ:</b> Shivam Kumar

<b>📱 Tɢ Uѕᴇʀɴᴀᴍᴇ:</b> <b>@ShivamNox</b> 

<b>🌐 Pᴏʀtғᴏʟɪᴏ:</b> <b><a href="https://shivamnox.rf.gd">shivamnox.rf.gd</a></b> 

<b>✨ Cᴏɴnᴇᴄᴛ tᴏ mᴏʀᴇ cʀᴇᴀᴛɪvᴇ jᴏᴜʀɴᴇʏ✨</b> 
`;
    
 const help = `
<b>> Play Terabox Video by Link\nExᴀᴍᴘʟᴇ: Jᴜsᴛ sᴇɴᴅ any Terabox link</b>
    
<b>> Get Direct Adult Video/Webseries/Movies:\nSend any Name</b>

<b>> /getvideo:\nGet Direct Video</b>

<b>> /all: See all videos from a category</b>
`;

const contactmsg = `
<blockquote><b>Nᴏᴛᴇ:</b></blockquote>
<blockquote><b>Wᴀɴᴛ A Bᴏᴛ Lɪᴋᴇ Tʜɪs:</b></blockquote>
<blockquote><b>I Wɪʟʟ Cʀᴇᴀᴛᴇ Oɴᴇ Bᴏᴛ Fᴏʀ Yᴏᴜ\nCᴏɴᴛᴀᴄᴛ tᴏ ᴛʜᴇ Dᴇvᴇʟᴏpᴇʀ</b></blockquote>
`;

      const welcomeImageUrl = 'https://i.pinimg.com/originals/47/5b/59/475b59c61a6efb3ec8ac0a57e43fd03b.webp'; // Replace with an actual image URL

      const startButtons = {
        reply_markup: {
          inline_keyboard: [
            [{
              text: '🎬 See Channel',
              url: 'https://t.me/Hivabyte'
            }],
            [{
              text: '🔗 Share Bot',
              callback_data: 'share_bot'  // This triggers a callback for sharing
            }]
          ]
        }
      };

      await bot.sendPhoto(chatId, welcomeImageUrl, { 
  caption: welcomeMessage, 
  parse_mode: 'HTML', 
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌟 Aᴅᴅ Mᴇ Tᴏ Yᴏᴜʀ Gʀᴏᴜᴘ 🌟', url: `https://t.me/${botUsername}?startgroup=true` }],
      [
        { text: '🍂 Uᴘᴅᴀᴛᴇs 🍂', url: `${UpdateChannelLink}` },
        { text: '🫨 Mᴏᴠɪᴇ Gʀᴏᴜᴘ', url: `${GroupLink}` }
      ],
      [
        { text: 'Hᴇʟᴘ', callback_data: 'help' },
        { text: 'Aʙᴏᴜᴛ', callback_data: 'about' }
      ]
    ]
  }
});
      
      
      // Listen for callback query to show the About message or go back
bot.on('callback_query', (query) => {
  const messageId = query.message.message_id;
  const chatId = query.message.chat.id;
  
  if (query.data === 'contactmsg') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: contactmsg, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Cᴏɴᴛᴀᴄᴛ', url: 'https://t.me/shivamnox' },
            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'about' }
          ]
        ]
      }
    });
  }
  
  if (query.data === 'help') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: help, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            
            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }
          ]
        ]
      }
    });
  }
  
  if (query.data === 'ownerinfo') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: OwnerInfo, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            
            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'about' }
          ]
        ]
      }
    });
  }

  if (query.data === 'about') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: aboutMessage, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
       inline_keyboard: [
          [
            { text: '👨‍💻 Oᴡɴᴇʀ Iɴfᴏ', callback_data: 'ownerinfo' },
            { text: 'Sᴏᴜʀᴄᴇ Cᴏᴅᴇ', callback_data: 'contactmsg' }
          ],
          [ { text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }]
        ]
      }
    });
  }

  if (query.data === 'back') {
    // Revert back to the original greeting image and message
    bot.editMessageMedia({
      type: 'photo',
      media: welcomeImageUrl, // The same image as the original one
      caption: welcomeMessage, // The original greeting caption
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌟 Aᴅᴅ Mᴇ Tᴏ Yᴏᴜʀ Gʀᴏᴜᴘ 🌟', url: `https://t.me/${botUsername}?startgroup=true` }],
          [
            { text: '🍂 Uᴘᴅᴀᴛᴇs 🍂', url: `${UpdateChannelLink}` },
            { text: '🫨 Mᴏᴠɪᴇ Gʀᴏᴜᴘ', url: `${GroupLink}` }
          ],
          [
            { text: 'Hᴇʟᴘ', callback_data: 'help' },
            { text: 'Aʙᴏᴜᴛ', callback_data: 'about' }
          ]
        ]
      }
    });
  } 
  
  if (query.data === 'buy') {
    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: welcomeImageUrl,
      caption: buypremium, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
       inline_keyboard: [
  [
    { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/shivamnox' },
    ],[{ text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }
  ]
]

      }
    });
  }

  // Answer the callback query to remove the loading animation on the button
  bot.answerCallbackQuery(query.id);
});
      
      
    }
  } catch (error) {
    console.error('Error processing /start command:', error);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again later.');
  }
});



  const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About
  const buypremium = `
<blockquote><b>Hᴇʏ Pʀᴇᴍɪᴜᴍ Pʟᴀɴ</b></blockquote>\n
<blockquote><b>Pʀᴇᴍɪᴜᴍ Fᴇᴀᴛᴜʀᴇs</b></blockquote>
<blockquote><b>Wɪᴛʜᴏᴜᴛ ᴀᴅs\nNᴏ vᴇʀɪғɪᴄᴀᴛɪᴏɴ\nDɪʀᴇᴄᴛ Adult Videos\nAdult Webseries, Viral/Onlyfan Videos, Parody Movies, Full Videos, Desi Videos\nDirect Search by name\nCan use /getvideo and /all Command.</b></blockquote>\n
<blockquote><b>ᴀʟʟ Pʀɪᴄᴇ Lɪsᴛ</b></blockquote>
<blockquote><b>Rs10 - 1 Wᴇᴇᴋ\nRs30 - 1 Mᴏɴᴛʜ\nRs60 - 2 Mᴏɴᴛʜs\nRs90 - 3 Mᴏɴᴛʜs\nRs120 - 7 Mᴏɴᴛʜs</b></blockquote>\n
<blockquote><b>UPI ID -</b> hɪᴠᴀᴊᴏʏ@ᴋᴏᴛᴀᴋ</blockquote>
<blockquote><b>Sᴇɴᴅ SS Aғᴛᴇʀ Pᴀʏᴍᴇɴᴛ</b></blockquote>
`;

// Handle /plan command
bot.onText(/\/plan/, (msg) => {
  const chatId = msg.chat.id;
  
  // Edit the message to show the About message along with the new image
  bot.sendPhoto(chatId, imageUrl, {
    caption: `${buypremium}`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/shivamnox' }
        ],
        [
          { text: 'Delete', callback_data: 'delete_plan_message' }
        ]
      ]
    }
  });
});

  // Handle callback queries from the inline buttons
bot.on('callback_query', (query) => {
  const messageId = query.message.message_id;
  const chatId = query.message.chat.id;

  if (query.data === 'delete_plan_message') {
    // Delete the message when 'Delete' is clicked
    bot.deleteMessage(chatId, messageId)
      .then(() => {
      })
      .catch((error) => {
        console.error('Error deleting message:', error);
      });
  }
  if (query.data === 'buyprime') {
      // Edit the message to show the About message along with the new image
  bot.sendPhoto(chatId, imageUrl, {
    caption: `${buypremium}`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/shivamnox' }
        ],
        [
          { text: 'Delete', callback_data: 'delete_plan_message' }
        ]
      ]
    }
  });
    }
});




// Function to get userId from referral code
async function getUserIdFromReferral(referralCode) {
  try {
    const user = await User.findOne({ referralLink: `https://t.me/${botUsername}?start=${referralCode}` });
    return user ? user.userId : null;
  } catch (error) {
    console.error('Error fetching user by referral code:', error);
    return null;
  }
}



// Function to handle the /mydash command
bot.onText(/\/mydash/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // The user's unique Telegram ID

  try {
    // Fetch the user from the database
    const user = await User.findOne({ userId });

    if (!user) {
      bot.sendMessage(chatId, '❌ You are not registered in the system. Please start by sending /start to register.');
      return;
    }

    
    
    let rewardsMessage = '';
      if (user.referralsCount >= 100) {
        rewardsMessage = `
🎉 <b>Congratulations!</b> You’ve earned 20 links per day with 10 or more referrals! 🚀
        `;
      } else if (user.referralsCount >= 50) {
        rewardsMessage = `
🎉 <b>Great Job!</b> You’ve earned 15 links per day with 5 or more referrals! 🌟
        `;
      } else {
        rewardsMessage = `
👀 Keep inviting friends! You’re on your way to unlocking great rewards! 🎁\n\nComing Soon... 🌟
        `;
      }
    
// Prepare the user dashboard with the details
const userDashboard = `
🌟 <b>Welcome to Your Dashboard, ${user.username}!</b> 🌟

━━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Profile Information</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Username:</b> ${user.username}
- <b>User ID:</b> ${user.userId}
- <b>Joined On:</b> ${user.initialJoinDate.toLocaleString()}
- <b>Last Login:</b> ${user.lastJoinDate.toLocaleString()}</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<b>📈 Referral Statistics</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Referrals Count:</b> ${user.referralsCount} 
${rewardsMessage}
✨ Invite friends to increase your referrals and unlock rewards!</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<b>🔗 Watch Links Overview</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Links Generated:</b> ${user.watchLinksCount}  
🚀 Keep generating more links and boost your rewards!</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote><b>🎉 Thank you for being a valued member!</b></blockquote>
`;




// Example: Sending this message in a Telegram bot
bot.sendMessage(chatId, userDashboard, { parse_mode: 'HTML' });


  } catch (error) {
    console.error('Error processing /mydash command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching your dashboard. Please try again later.');
  }
});



// Handle the callback queries (View Rewards, Share, etc.)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userId = callbackQuery.from.id;
  const callbackData = callbackQuery.data;

  try {
    // Fetch the user details to get the referral link
    const user = await User.findOne({ userId });

    if (!user) {
      return bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
    }

    // Check if the callback data is 'view_rewards'
    if (callbackQuery.data === 'view_rewards') {
      // Prepare the rewards message based on referral count
      let rewardsMessage = '';
      if (user.referralsCount >= 100) {
        rewardsMessage = `
🎉 <b>Congratulations!</b> You’ve earned 20 links per day with 10 or more referrals! 🚀
        `;
      } else if (user.referralsCount >= 50) {
        rewardsMessage = `
🎉 <b>Great Job!</b> You’ve earned 15 links per day with 5 or more referrals! 🌟
        `;
      } else {
        rewardsMessage = `
👀 Keep inviting friends! You’re on your way to unlocking great rewards! 🎁\n\nComing Soon... 🌟
        `;
      }

      // Edit the message to show rewards info and the Back button
      await bot.editMessageText(rewardsMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔙 Back to Share',
                callback_data: 'back_to_share', // Go back to share message
              },
            ],
          ],
        },
      });
    }

    // Check if the callback data is 'back_to_share'
    else if (callbackQuery.data === 'back_to_share') {
      // Prepare the original referral message
      const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
      `;

      // Edit the message back to the original share message (without Back button)
      await bot.editMessageText(referMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📤 Share with Friends',
                switch_inline_query: referMessage, // Allows sharing via inline
              },
            ],
            [
              {
                text: '🎁 View Rewards',
                callback_data: 'view_rewards', // Show rewards info
              },
            ],
          ],
        },
      });
    }

    // Check if the callback data is 'share_bot'
    else if (callbackData === 'share_bot') {
      
       // Prepare the referral message
      const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
      `;
 // Send the referral message with inline buttons
      await bot.sendMessage(chatId, referMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📤 Share with Friends',
                switch_inline_query: referMessage, // Allows sharing via inline
              },
            ],
            [
              {
                text: '🎁 View Rewards',
                callback_data: 'view_rewards', // Show rewards info
              },
            ],
          ],
        },
      });
      
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again later.');
  }
});





// Handle the /refer command
bot.onText(/\/refer/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Fetch the user details to get the referral link
    const user = await User.findOne({ userId });

    if (!user) {
      return bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
    }

    // Make sure botUsername is populated
    if (!botUsername) {
      return bot.sendMessage(chatId, '❌ Unable to fetch bot username. Please try again later.');
    }

    // Prepare the referral message
    const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
    `;

    // Send the referral message with inline buttons
    await bot.sendMessage(chatId, referMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📤 Share with Friends',
              switch_inline_query: referMessage, // Allows sharing via inline
            },
          ],
          [
            {
              text: '🎁 View Rewards',
              callback_data: 'view_rewards', // Show rewards info
            },
          ],
        ],
      },
    });

  } catch (error) {
    console.error('Error handling /refer command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again later.');
  }
});






bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // The user's unique Telegram ID
  const caption = msg.text; // Let allows reassignment

if(caption){
  handleCaption(msg, chatId, caption);
}
});


// Store the user's photo activity with timestamps and the time of last limit exceedance
const userPhotoCount = {};

// Helper function to check and update the photo limit
const checkPhotoLimit = (userId) => {
  const currentTime = Date.now();
  if (!userPhotoCount[userId]) {
    userPhotoCount[userId] = { timestamps: [], lastExceeded: null };
  }

  // Filter out photos that are older than 1 minute (60000 milliseconds)
  userPhotoCount[userId].timestamps = userPhotoCount[userId].timestamps.filter(timestamp => currentTime - timestamp < 60000);

  // Check if the user has sent more than 5 photos in the last minute
  if (userPhotoCount[userId].timestamps.length >= 5) {
    // Set the time when the user exceeded the limit
    if (!userPhotoCount[userId].lastExceeded) {
      userPhotoCount[userId].lastExceeded = currentTime;
    }
    return false; // Exceeded limit
  }

  // Otherwise, add the current timestamp
  userPhotoCount[userId].timestamps.push(currentTime);
  return true;
};

// Handle photo (image) files
bot.on('photo', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const caption = msg.caption;

  // Check if the user exceeds the photo sending limit
  if (!checkPhotoLimit(userId)) {
    // Calculate the remaining time until the user can send another photo
    const currentTime = Date.now();
    const lastExceeded = userPhotoCount[userId].lastExceeded;
    const elapsedTime = currentTime - lastExceeded;

    // Calculate the remaining time (ensure it's not negative)
    const remainingTime = Math.max(0, 60000 - elapsedTime);

    // Convert remaining time to seconds
    const remainingSeconds = Math.ceil(remainingTime / 1000);

    // Send a message notifying the user about the limit and the remaining time
    bot.sendMessage(chatId, `You can only send 5 post per minute.\n\nPlease try again in ${remainingSeconds} sec.`);
    return; // Exit the function without processing the photo
  }

  // Process the caption if there is one
  if (caption) {
    handleCaption(msg, chatId, caption);
  }
});





// Function to handle captions
async function handleCaption(msg, chatId, caption) {

    
  const userId = msg.from.id; // The user's unique Telegram ID
  let text = caption; // Let allows reassignment

  try {
    let user = await User.findOne({ userId: String(chatId) });

    // Just send the message with the URL as plain text (without Markdown)
    const plainTextMessage = text.replace(/https?:\/\/[^\s]+/g, (url) => {
      return url; // No escaping, just plain text
    });

    // Forward the message to the channel
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username;


    console.log(`Forwarded message from @${msg.from.username} to the channel via @${bot.username}`);

    // Check if the message contains a valid URL
    if (text && text.match(/https?:\/\/\S+/)) {
      user = await User.findOne({ userId });

      if (!user) {
        await bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
        return;
      }

      const chatMember = await bot.getChatMember('@Hivabyte', userId);

      // Check for TeraBox specific URL
      const teraboxRegex = /https?:\/\/([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\/wap\/share\/filelist\?surl=([a-zA-Z0-9_-]+)/;
      const teraboxMatch = text.match(teraboxRegex);

      if (teraboxMatch) {
        // Extract the ID from the `surl` parameter (captured group 2)
        const surlId = teraboxMatch[2];
        // Convert the TeraBox URL to the required format
        const fullUrl = `https://teraboxapp.com/s/1${surlId}`;
        // Replace the original URL with the new one
        text = fullUrl;
      }

      // Define regex to match any URL containing "/s/" (after the domain)
      const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+\/s\/[a-zA-Z0-9_-]+)/;
      const match = text.match(urlRegex);

      if (match) {
        user.watchLinksCount += 1;
        await user.save();

        const fullUrl = match[0]; // The matched URL
        const urlid = fullUrl.split('/s/')[1]; // Extract the ID after '/s/'
        const slicedId = urlid.slice(1); // Remove the first character of the ID
        const { saveHash } = require('./hashstore');
saveHash(slicedId);

        const generatingMessage = await bot.sendMessage(chatId, '🔄 Generating, Please Wait...', { reply_to_message_id: msg.message_id });

        const apiUrl = `https://core.mdiskplay.com/box/terabox/${slicedId}?aka=baka`;
        const glitch = `http://hivajoy.fwh.is/tb/w/${slicedId}`;
        const apiurl = `https://api.roldex.me/?url=${fullUrl}&api_key=abc`;
        const tb = `https://terabox-online-player.blogspot.com/p/newtbapiframe.html?url=${fullUrl}`;
        const mdiskplay = `https://terabox-online-player.blogspot.com/p/mdiskplay.html?id=${slicedId}`;
        const newapi = `https://arewhai35.brendanav492.workers.dev/?id=${urlid}`;
        const cheemsapi = `https://cheems-8hj.pages.dev/?q=${urlid}`;
        const browse = `http://hivajoy.fwh.is/play?id=${urlid}`;
        try {
          await axios.get(apiUrl, newapi);

          // After the API URL has been "accessed", send the play and download links
          const videoUrl = `https://video.mdiskplay.com/${slicedId}.m3u8`;
          const mdiskimg = `https://core.mdiskplay.com/images-tb/${slicedId}.jpg`;
          const newLink = `https://terabox-online-player2.blogspot.com?q=${fullUrl}`;
          const desktoplink = `https://hivabytes.blogspot.com/2024/01/unveiling-secrets-hidden-shift-quantum.html?url=${fullUrl}`;
          const downapi = `https://terabox.hnn.workers.dev`;
          

          await bot.deleteMessage(chatId, generatingMessage.message_id);

          // Send the generated links as a reply
await bot.sendPhoto(
  chatId, 
  mdiskimg, 
  {
    caption: `<b>Player 1⚡:</b> <a href="${glitch}">WATCH NOW</a>\n\n🚀 Try Website: http://hivajoy.rf.gd/p/terabox/player`,
    parse_mode: 'HTML',
    reply_to_message_id: msg.message_id,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '⚡ 1.Watch Now',
            web_app: { url: videoUrl },
          },
        ],
        [
          {
            text: '▶️ 2.Watch Now',
            web_app: { url: newapi },
          },
        ]
      ],
    },
  }
);

          const forwardedMessage = `<b>Player 1 Watch Link:</b> <a href="${videoUrl}">WATCH NOW</a>\n\n<b>Player 2 ⚡Fast Watch:</b> <a href="${newapi}">WATCH NOW</a>\n\n<b>Player 3 ⚡Fast Watch:</b> <a href="${tb}">WATCH NOW</a>`;

          // Forward the final message to the channel
          await bot.sendMessage(
            channelId,
            `Forwarded by @${botUsername} from User Name:${msg.from.first_name}, ID:${msg.from.id}:\n\n${forwardedMessage}`,
            {
              parse_mode: 'HTML',
              disable_web_page_preview: true,  // Disable URL previews
            }
          );
        } catch (error) {
          console.error('Error accessing the API:', error);
          const videoUrl = `https://video.mdiskplay.com/${slicedId}.m3u8`;
          const newLink = `https://terabox-online-player2.blogspot.com?q=${fullUrl}`;
          await bot.deleteMessage(chatId, generatingMessage.message_id);

          // Send the generated links as a reply
          await bot.sendMessage(
            chatId,
            `<b>Player 1⚡:</b> <a href="${browse}">WATCH NOW</a>\n\n🚀 Try Website: http://hivajoy.rf.gd/p/terabox/player`,
            {
              parse_mode: 'HTML',
              reply_to_message_id: msg.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '⚡ Watch Now',
                      web_app: { url: `${newapi}` },
                    },
                  ],
                  [
                    {
                      text: '⚡ Watch Now',
                      web_app: { url: `${tb}` },
                    },
                  ],
                  [
                    {
                      text: '🧡 Share Bot 🧡',
                      callback_data: 'share_bot',
                    },
                  ],
                ],
              },
            }
          );
const forwardedMessage = `<b>Player 1 Watch Link:</b> <a href="${newapi}">WATCH NOW</a>\n\n<b>Player 2 ⚡Fast Watch:</b> <a href="${tb}">WATCH NOW</a>\n\n<b>Player 3 ⚡Fast Watch:</b> <a href="${newapi}">WATCH NOW</a>`;

          // Forward the final message to the channel
          await bot.sendMessage(
            channelId,
            `Forwarded by @${botUsername} from User Name:${msg.from.first_name}, ID:${msg.from.id}:\n\n${forwardedMessage}`,
            {
              parse_mode: 'HTML',
              disable_web_page_preview: true,  // Disable URL previews
            }
          );

        }
      } else {
        await bot.sendMessage(chatId, '⚠️ Please send a valid Terabox URL that contains.\n\n📜 Example: `https://teraboxapp.com/s/1Hia89nsiwunsn`');
      }
    } else if (text.startsWith('/')) {
      return;
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
  
}



// Helper function to generate a token
const generateToken = () => crypto.randomBytes(4).toString('hex');
  // Ensure axios is properly imported at the top of the file

const fetch = require('node-fetch');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false  // Disable SSL validation
});

// Function to follow redirects and get the final shortened URL
const shortenUrlWithhjlink = async (longUrl) => {
  const apiUrl = `https://linkmonetizer.in/api?api=08c10c6351b418319b95461f4c4b46a1ffd1523b&url=${encodeURIComponent(longUrl)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();  // Parse the JSON response

    if (data && data.shortenedUrl) {
      return data.shortenedUrl; // Return the shortened URL
    } else {
      throw new Error('No shortened URL found in the response.');
    }
  } catch (error) {
    console.error('Error shortening URL with hjlink:', error);
    return null;
  }
};

const { getAllHashes } = require('./hashstore');

app.get('/has', (req, res) => {
  const hashes = getAllHashes().reverse(); // Newest first

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shorts Style Video Player</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #000;
        }

        #playerContainer {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        video {
          width: 100vw;
          height: 100vh;
          
        }

        #overlay {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.5);
          padding: 4px 10px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>

      <div id="playerContainer">
        <video id="player" autoplay controls muted playsinline>
          <source id="videoSource" src="https://arewhai35.brendanav492.workers.dev/?id=1${hashes[0]}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div id="overlay">1 of ${hashes.length}</div>
      </div>

      <script>
        const hashes = ${JSON.stringify(hashes)};
        let currentIndex = 0;

        const player = document.getElementById('player');
        const videoSource = document.getElementById('videoSource');
        const overlay = document.getElementById('overlay');

        function updateVideo() {
          const currentHash = hashes[currentIndex];
          videoSource.src = \`https://arewhai35.brendanav492.workers.dev/?id=1\${currentHash}\`;
          player.load();
          overlay.textContent = \`\${currentIndex + 1} of \${hashes.length}\`;
        }

        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', function (e) {
          touchStartY = e.changedTouches[0].screenY;
        }, false);

        document.addEventListener('touchend', function (e) {
          touchEndY = e.changedTouches[0].screenY;
          handleGesture();
        }, false);

        function handleGesture() {
          const swipeThreshold = 50;

          if (touchStartY - touchEndY > swipeThreshold) {
            // Swipe Up → Next video
            if (currentIndex < hashes.length - 1) {
              currentIndex++;
              updateVideo();
            }
          } else if (touchEndY - touchStartY > swipeThreshold) {
            // Swipe Down → Previous video
            if (currentIndex > 0) {
              currentIndex--;
              updateVideo();
            }
          }
        }

        // Optional: Arrow keys for desktop testing
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp') {
            if (currentIndex > 0) {
              currentIndex--;
              updateVideo();
            }
          } else if (e.key === 'ArrowDown') {
            if (currentIndex < hashes.length - 1) {
              currentIndex++;
              updateVideo();
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  res.send(html);
});










// Function to handle the /stats command (only for bot owner)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Replace with the actual owner userId
    // Replace with actual owner ID

  if (userId !== ownerId) {
    return bot.sendMessage(chatId, '❌ You are not authorized to view this information.');
  }

  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastJoinDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });  // Users who joined in the last 30 days
    const deletedAccounts = await User.countDocuments({ deletedAt: { $ne: null } });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Aggregate the total watch links generated across all users
    const totalWatchLinks = await User.aggregate([
      { $group: { _id: null, totalWatchLinks: { $sum: "$watchLinksCount" } } }
    ]);

    const tviral = await Viral.countDocuments();
    const tparody = await Parody.countDocuments();
    const twebs = await Webs.countDocuments();
    const tfvideo = await Fvideo.countDocuments();
    
   const statsMessage = `
      🌟 <b>✨ Bot Usage Statistics ✨</b> 🌟

      <b>📊 Total Users:</b> <i>${totalUsers}</i>
      <b>🔥 Active Users (Last 30 days):</b> <i>${activeUsers}</i>
      <b>❌ Deleted Accounts:</b> <i>${deletedAccounts}</i>
      <b>🚫 Blocked Users:</b> <i>${blockedUsers}</i>

      <b>🔗 Total Watch Links Generated:</b> <i>${totalWatchLinks[0]?.totalWatchLinks || 0}</i>
      <b>📈 Total Viral:</b> <i>${tviral}</i>
      <b>🎭 Total Parody:</b> <i>${tparody}</i>
      <b>🌐 Total WebS:</b> <i>${twebs}</i>
      <b>🎥 Total FVideo:</b> <i>${tfvideo}</i>
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error processing /stats command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching statistics. Please try again later.');
  }
});






// Broadcast command
bot.onText(/\/broadcast/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(chatId, '❌ You are not authorized to use this command.');
  }

  // Check if the message is a reply to another message (either text, photo, or video)
  if (msg.reply_to_message) {
    const broadcastMessage = msg.reply_to_message;
    let broadcastType = '';

    if (broadcastMessage.photo) {
      broadcastType = 'photo';
    } else if (broadcastMessage.video) {
      broadcastType = 'video';
    } else if (broadcastMessage.text) {
      broadcastType = 'text';
    } else {
      return bot.sendMessage(chatId, '❌ Unsupported media type for broadcasting.');
    }

    bot.sendMessage(chatId, '📢 Broadcast started! Sending messages...');

    // Get all users from the database
    const users = await User.find();
    let sentCount = 0;
    let failedCount = 0;

    // Track users who have already received the message
    const sentUsers = new Set();  // This will store user IDs to avoid sending multiple times

    // Send initial broadcast progress message
    let progressMessage = await bot.sendMessage(chatId, `📢 Broadcast Progress Update:\n\n✅ Sent to: ${sentCount} users\n❌ Failed to send to: ${failedCount} users`);

    // Function to send the broadcast message and track progress
    const sendBroadcast = async () => {
      for (const user of users) {
        if (sentUsers.has(user.userId)) {
          continue;  // Skip users who have already received the broadcast
        }

        try {
          if (broadcastType === 'photo') {
            await bot.sendPhoto(user.userId, broadcastMessage.photo[0].file_id, { caption: broadcastMessage.caption });
          } else if (broadcastType === 'video') {
            await bot.sendVideo(user.userId, broadcastMessage.video.file_id, { caption: broadcastMessage.caption });
          } else if (broadcastType === 'text') {
            await bot.sendMessage(user.userId, broadcastMessage.text);
          }
          sentCount++;
          sentUsers.add(user.userId);  // Add user to the sentUsers set
        } catch (err) {
          failedCount++;
        }

        // Update the progress message
        await bot.editMessageText(
          `📢 Broadcast Progress Update:\n\n✅ Sent to: ${sentCount} users\n❌ Failed to send to: ${failedCount} users`,
          {
            chat_id: chatId,
            message_id: progressMessage.message_id
          }
        );
      }

      // After all users are processed, send the final report
      bot.editMessageText(
        `✅ Broadcast complete!\nSent to: ${sentCount} users\nFailed to send to: ${failedCount} users.`,
        {
          chat_id: chatId,
          message_id: progressMessage.message_id
        }
      );
    };

    // Start broadcasting with real-time updates
    sendBroadcast();
  } else {
    bot.sendMessage(chatId, '❌ Please reply to a message or media that you want to broadcast.');
  }
});




// Handle document files
bot.on('document', async (msg) => {
  const userId = msg.from.id;

  if (userId === OWNER_ID) {
    const document = msg.document;
    const fileId = document.file_id;
    const fileName = document.file_name;

    // Generate a unique ID for the file
    const uniqueId = crypto.randomBytes(8).toString('hex');

    // Save file details to the database
    const newFile = new FileModel({
      uniqueId: uniqueId,
      fileId: fileId,
      type: 'document',  // Document type
      fileName: fileName,
      caption: `Document: ${fileName}`
    });

    await newFile.save();

    // Create the sharable link
    const sharableLink = `https://t.me/${botUsername}?start=file_${uniqueId}`;

    // Send a confirmation message with the sharable link
    bot.sendMessage(userId, `Document uploaded successfully!\nYou can share the link: ${sharableLink}`);
  } else {
    // If the user is not the owner, send a warning message
    bot.sendMessage(userId, 'Only the owner can upload files!');
  }
});

// Handle video files
let currentCategory = null; // To store the active category

// Handle category selection by the owner
bot.onText(/\/on([a-zA-Z0-9]+)/, (msg, match) => {
  const userId = msg.from.id;

  if (userId === OWNER_ID) {
    const category = match[1];  // Extract category from the command
    currentCategory = category; // Set the current category
    bot.sendMessage(userId, `Category "${category}" selected. You can now upload files for this category.`);
  } else {
    bot.sendMessage(userId, 'Only the owner can manage categories!');
  }
});

// Handle finishing the upload process for a category
bot.onText(/\/finish([a-zA-Z0-9]+)/, async (msg, match) => {
  const userId = msg.from.id;

  if (userId === OWNER_ID) {
    const category = match[1];  // Extract category from the command
    if (currentCategory === category) {
      bot.sendMessage(userId, `Category "${category}" upload process finished.`);
      currentCategory = null;  // Reset the current category
    } else {
      bot.sendMessage(userId, `No active category for "${category}". Please start a category first.`);
    }
  } else {
    bot.sendMessage(userId, 'Only the owner can manage categories!');
  }
});

bot.on('video', async (msg) => {
  const userId = msg.from.id;
  const caption = msg.caption;
  const chatId = msg.chat.id;
if(caption){
  handleCaption(msg, chatId, caption);
}
  if (userId === OWNER_ID) {
    if (!currentCategory) {
      bot.sendMessage(userId, 'Please select a category first using /oncategory command.');
      return;
    }

    const video = msg.video;
    const fileId = video.file_id;
    let fileName = video.file_name || "video.mp4";

  // Regular expression to match and remove @username or URLs starting with https://
const sanitizePattern = /(@\w+|https?:\/\/[^\s]+|\bgetnewlink\.com\b|\b\w+\.(com|in|net|org|edu|gov|co|io|xyz)\b)/gi;

  // Sanitize the file name by removing the matched patterns
  const sanitizeFileName = fileName.replace(sanitizePattern, '').trim();  // Default video name

    // Generate a unique ID for the video
    const uniqueId = crypto.randomBytes(8).toString('hex');

    // Save the video into the appropriate category schema
    let newFile;
    switch (currentCategory) {
      case 'parody':
        newFile = new Parody({
          uniqueId: uniqueId,
          fileId: fileId,
          fileName: sanitizeFileName,
          caption: `Video: ${sanitizeFileName}`,
        });
        break;
      case 'viral':
        newFile = new Viral({
          uniqueId: uniqueId,
          fileId: fileId,
          fileName: sanitizeFileName,
          caption: `Video: ${sanitizeFileName}`,
        });
        break;
      case 'webs':
        newFile = new Webs({
          uniqueId: uniqueId,
          fileId: fileId,
          fileName: sanitizeFileName,
          caption: `Video: ${sanitizeFileName}`,
        });
        break;
      case 'fvideo':
        newFile = new Fvideo({
          uniqueId: uniqueId,
          fileId: fileId,
          fileName: sanitizeFileName,
          caption: `Video: ${sanitizeFileName}`,
        });
        break;
      default:
        bot.sendMessage(userId, 'Invalid category.');
        return;
    }

    // Save the video
    await newFile.save();

    // Create a sharable link
    const sharableLink = `https://t.me/${botUsername}?start=file_${uniqueId}`;

    bot.sendMessage(userId, `Video uploaded successfully under "${currentCategory}" category! You can share the link: ${sharableLink}`);
  } else {
    // Only the owner can upload files
  }
});


// You can add similar code for handling other categories like parody, webseries, etc.


// Handle audio files
bot.on('audio', async (msg) => {
  const userId = msg.from.id;

  if (userId === OWNER_ID) {
    const audio = msg.audio;
    const fileId = audio.file_id;
    const fileName = audio.file_name || "audio.mp3";  // Default audio name

    // Generate a unique ID for the audio
    const uniqueId = crypto.randomBytes(8).toString('hex');

    // Save audio details to the database
    const newFile = new FileModel({
      uniqueId: uniqueId,
      fileId: fileId,
      type: 'audio',  // Audio type
      fileName: fileName,
      caption: `Audio: ${fileName}`
    });

    await newFile.save();

    // Create the sharable link
    const sharableLink = `https://t.me/${botUsername}?start=file_${uniqueId}`;

    // Send a confirmation message with the sharable link
    bot.sendMessage(userId, `Audio uploaded successfully!\nYou can share the link: ${sharableLink}`);
  } else {
    // If the user is not the owner, send a warning message
    bot.sendMessage(userId, 'Only the owner can upload files!');
  }
});




async function handleverification(chatId) {
  const waitmsg = await bot.sendMessage(chatId, 'Generating');
  let user = await User.findOne({ userId: String(chatId) });
  // Generate a new token and short URL for verification
    const token = generateToken();
    user.token = token;
    user.tokenExpires = new Date(Date.now() + 5 * 60 * 1000); // Token expires in 5 minutes
    await user.save();

    const longUrl = `https://t.me/${botUsername}?start=token_${token}`;
    const shortUrl = await shortenUrlWithhjlink(longUrl);

    if (shortUrl) {
      bot.sendMessage(chatId, `Yᴏᴜʀ Aᴄᴄᴇss Tᴏkᴇɴ hᴀs ᴇxpɪʀᴇᴅ. Pʟᴇᴀsᴇ rᴇnᴇw ɪᴛ ᴀnd tʀʏ ᴀɢᴀɪɴ.

<b>Tᴏkᴇɴ Vᴀlɪdɪᴛʏ</b>: 5 mɪnᴜtᴇ

Tʜɪs ɪs ᴀn ᴀds-bᴀsᴇd ᴀcᴄᴇss tᴏkᴇɴ. Iғ yᴏᴜ pᴀss 1 ᴀcᴄᴇss tᴏkᴇɴ, yᴏᴜ cᴀn ᴀcᴄᴇss mᴇssᴀɢᴇs fʀᴏᴍ sʜᴀrᴀʙʟᴇ lɪɴᴋs fᴏʀ ᴛʜᴇ nᴇxt 5 mɪnᴜtᴇ.`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Vᴇʳɪfʏ', url: shortUrl }, { text: 'Hᴏw tᴏ Vᴇʳɪfʏ', url: `https://t.me/hivajoytrick/23` }],
            [
              { text: '🎥 Try Demo', callback_data: 'demo_button' }
            ],
            [
              { text: 'Bᴜʏ Pʀᴇᴍɪᴜᴍ | Rᴇmᴏᴠᴇ ᴀᴅs', callback_data: 'buyprime' }
            ]
          ]
        }
      });
    } else {
      bot.sendMessage(chatId, 'Eʀʀᴏʀ ɢᴇɴᴇʀᴀᴛɪɴɢ sʜᴏʀᴛᴇɴᴇᴅ ᴜʀʟ. Pʟᴇᴀsᴇ tʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.');
    }
  
    bot.deleteMessage(chatId, waitmsg.message_id); // Deleting after 1 minute
}

// ✅ PRELOADED VIDEO STORAGE
let cachedVideos = {
  parody: [],
  viral: [],
  webs: [],
  fvideo: []
};

// ✅ FUNCTION TO PRELOAD VIDEOS
async function preloadVideos() {
  cachedVideos.parody = await Parody.find({}).sort({ _id: 1 }).lean();
  cachedVideos.viral = await Viral.find({}).sort({ _id: 1 }).lean();
  cachedVideos.webs = await Webs.find({}).sort({ _id: 1 }).lean();
  cachedVideos.fvideo = await Fvideo.find({}).sort({ _id: 1 }).lean();

  console.log(`✅ Preloaded videos - Parody: ${cachedVideos.parody.length}, Viral: ${cachedVideos.viral.length}, Webs: ${cachedVideos.webs.length}, Full: ${cachedVideos.fvideo.length}`);
}

// ⏳ Run preload when server starts
preloadVideos();


// ✅ Optional: Manual reload command (owner only)
bot.onText(/\/reloadvideos/, async (msg) => {
  if (msg.from.id.toString() === OWNER_ID) {
    await preloadVideos();
    bot.sendMessage(msg.chat.id, '🔄 Video cache reloaded!');
  }
});


// ✅ GETVIDEO COMMAND
bot.onText(/\/getvideo/, async (msg) => {
  const chatId = msg.chat.id;
  const isOwnerMessage = msg.from.id.toString() === OWNER_ID;
  const userId = msg.from.id.toString();

  let user = await User.findOne({ userId });
  const puser = await P_USERS.findOne({ puserId: userId });
  const ppuser = await PP_USERS.findOne({ puserId: userId, demoUsed: 0 });

  const isPuserMessage = puser !== null;
  const isPPuserMessage = ppuser !== null;

  const canUseCommand = user?.canUseCommandUntil > new Date();

  if (isOwnerMessage || isPuserMessage || isPPuserMessage || canUseCommand) {
    const categories = [
      { text: '🍑 Parody Movies 🎬', value: 'parody' },
      { text: '🔥 Viral Videos 📱', value: 'viral' },
      { text: '🌐 Web Series 💻', value: 'webs' },
      { text: '🍿 Full Videos 🎥', value: 'fvideo' }
    ];

    const categoryButtons = categories.map(category => ({
      text: category.text,
      callback_data: `category_${category.value}`,
    }));

    bot.sendMessage(chatId, 'Please choose a category:', {
      reply_markup: {
        inline_keyboard: chunkArray(categoryButtons, 1),
      },
    });
  } else {
    handleverification(chatId);
    return;
  }
});


// ✅ CALLBACK HANDLER FOR CATEGORY SELECTION
bot.on('callback_query', async (callbackQuery) => {
  const userId = callbackQuery.from.id;
  const chatId = userId;
  const category = callbackQuery.data.split('_')[1];

  if (
    ['view_rewards', 'contactmsg', 'back_to_share', 'share_bot', 'back', 'help', 'about', 'ownerinfo', 'buyprime', 'delete_plan_message', 'buy'].includes(callbackQuery.data)
  ) return;
  
  if (callbackQuery.data === 'category_parody' || callbackQuery.data === 'category_viral' || callbackQuery.data === 'category_webs' || callbackQuery.data === 'category_fvideo') {

  
  let user = await User.findOne({ userId });

  const puser = await P_USERS.findOne({ puserId: userId.toString() });
  const ppuser = await PP_USERS.findOne({ puserId: userId.toString(), demoUsed: 0 });

  const isPuserMessage = puser !== null;
  const isPPuserMessage = ppuser !== null;
  const canUseCommand = user?.canUseCommandUntil > new Date();

  // ✅ Use Preloaded Data Instead of Fetching Every Time
  const videoData = cachedVideos[category] || [];

  if (!videoData.length) {
    bot.sendMessage(userId, 'No videos available in this category.');
    return;
  }

  if (isPuserMessage || isPPuserMessage || canUseCommand) {
    const lastSentVideo = user.progress?.[category]?.lastSentVideo || null;

    let videoToSend;
    if (!lastSentVideo) {
      videoToSend = videoData[0];
    } else {
      const nextIndex = videoData.findIndex(v => v.uniqueId === lastSentVideo);
      videoToSend = videoData[nextIndex + 1] || videoData[0];
    }

    if (videoToSend) {
      user.progress[category] = {
        lastSentVideo: videoToSend.uniqueId
      };
      await user.save();

      bot.sendVideo(userId, videoToSend.fileId, {
        caption: videoToSend.fileName,
        reply_markup: {
          inline_keyboard: [[{ text: 'Next', callback_data: `category_${category}` }]]
        }
      });
    } else {
      bot.sendMessage(userId, 'No videos found.');
    }
  } else {
    handleverification(chatId);
    return;
  }
    }
});






// Helper function to chunk an array into smaller arrays (for inline keyboard)
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}



// Handle the callback from the "Try Demo" button
bot.on('callback_query', async (query) => { 
  const chatId = query.message.chat.id;
  const userId = query.from.id;
const ppuser = await PP_USERS.findOne({ puserId: userId.toString()});
  if (query.data === 'demo_button') {


        // If the user has already used the demo (demoUsed = 1), prompt them to buy the plan
        if (ppuser && ppuser.demoUsed === 0) {
                    // User has not used the demo yet (demoUsed = 0), show the demo access message
          bot.sendMessage(chatId, 
  '🎉 Demo Activated! You have 5 minute to experience it! ⏳\n\n🔑 Type /getvideo to proceed and unlock more!',
  {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Start Demo', callback_data: 'start_demo' }
        ]
      ]
    }
  }
);


          // Set expiration for demo (1 minute)
          setTimeout(() => {
            PP_USERS.updateOne(
              { puserId: userId }, 
              { $set: { demoUsed: 1 } }, // Set demoUsed to 1 (true)
              (updateErr) => {
                if (updateErr) {
                  console.log('Error updating demo usage:', updateErr);
                } else {
                  console.log('Demo expired for user, updated demoUsed flag');
                }
              }
            );
          
          }, 5 * 60 * 1000); // 1 minute delay
  // 1 minute in milliseconds
       
        } 
       else if (!ppuser) {
        // If the user doesn't exist, add them to the database
        const currentTime = new Date();
        const newUser = new PP_USERS({
          puserId: userId,
          firstName: query.from.first_name,
          username: query.from.username,
          demoUsed: 0,  // 0 means demo hasn't been used
          demoStartTime: currentTime // Store the demo start time
        });

        // Save the user to the database
        newUser.save((saveErr) => {
          if (saveErr) {
            console.log('Error saving user to the database:', saveErr);
            return;
          }

          // Send demo access message
         bot.sendMessage(chatId, 
  '🎉 Demo Activated! You have 5 minute to experience it! ⏳\n\n🔑 Type or Click /getvideo to proceed');


          // Set expiration for demo (1 minute)
          setTimeout(() => {
            PP_USERS.updateOne(
              { puserId: userId }, 
              { $set: { demoUsed: 1 } }, // Set demoUsed to 1 (true)
              (updateErr) => {
                if (updateErr) {
                  console.log('Error updating demo usage:', updateErr);
                } else {
                  console.log('Demo expired for new user, updated demoUsed flag');
                }
              }
            );
          }, 5 * 60 * 1000);  // 1 minute in milliseconds
        });
      } else {
            bot.sendMessage(userId, 
      '***⏳ Oops! Your Plan/demo has expired***\n\n✨ Upgrade to the ***Premium Users Plan***\n👉 Click below to unlock premium content instantly! 🔑',
      { parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
        { text: '💳 View Pʀᴇᴍɪᴜᴍ Plan', callback_data: 'buyprime' }
      ]
          ]
        }
      }
    );
      }
   
  }
});






const searchStates = {}; // Maintain pagination state per user

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const queryText = msg.text?.trim();

  const puser = await P_USERS.findOne({ puserId: userId });
  if (!puser || !queryText || queryText.startsWith('/') || queryText.startsWith('http') || /^\d/.test(queryText)) return;

  const searchWords = queryText.toLowerCase().split(/\s+/);

  const allVideos = Object.values(cachedVideos).flat();

  const results = allVideos.filter(file =>
    searchWords.every(word =>
      file.fileName?.toLowerCase().includes(word)
    )
  );

  if (results.length === 0) {
    return bot.sendMessage(chatId, `❌ No results found for "${queryText}".`);
  }

  // Set user state
  searchStates[userId] = {
    results,
    queryText,
    currentPage: 1,
    totalPages: Math.ceil(results.length / 10)
  };

  sendSearchResults(chatId, userId, msg.message_id);
});
bot.on('callback_query', async (callbackQuery) => {
  const userId = callbackQuery.from.id.toString();
  const chatId = callbackQuery.message.chat.id;
  const state = searchStates[userId];

  if (!state) return;

  const { results, queryText, currentPage, totalPages } = state;

  if (callbackQuery.data === 'next' && currentPage < totalPages) {
    state.currentPage++;
  } else if (callbackQuery.data === 'prev' && currentPage > 1) {
    state.currentPage--;
  } else {
    return bot.answerCallbackQuery(callbackQuery.id);
  } 

  sendSearchResults(chatId, userId, callbackQuery.message.message_id);
  bot.answerCallbackQuery(callbackQuery.id);
});
 async function sendSearchResults(chatId, userId, messageId) {
  const { results, currentPage, totalPages, queryText } = searchStates[userId];

  const start = (currentPage - 1) * 10;
  const pageResults = results.slice(start, start + 10);

  const buttons = pageResults.map(file => [{
    text: file.fileName,
    url: `https://t.me/terabox_player_hj_bot?start=file_${file.uniqueId}`
  }]);

  const navButtons = [];

  if (currentPage > 1) navButtons.push({ text: '⬅ Prev', callback_data: 'prev' });
  navButtons.push({ text: `${currentPage}/${totalPages}`, callback_data: 'page_info' });
  if (currentPage < totalPages) navButtons.push({ text: 'Next ➡', callback_data: 'next' });

  if (navButtons.length) buttons.push(navButtons);

 try {
  await bot.editMessageText(`Search results for: *${queryText}*\nPage ${currentPage} of ${totalPages}`, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttons,
    }
  });
} catch (err) {
  console.log('❌ Edit failed:', err.message);

  // Fallback: send new message
  await bot.sendMessage(chatId, `Search results for: *${queryText}*\nPage ${currentPage} of ${totalPages}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

}





bot.onText(/\/all/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  const puser = await P_USERS.findOne({ puserId: userId });
  const isPuserMessage = puser !== null;

  let user = await User.findOne({ userId });
  if (!user) {
    await bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
    return;
  }

  if (!isPuserMessage) {
    bot.sendMessage(chatId, 'Please send a Terabox URL For Watch Online.\n\nAnd For Direct Video Send /getvideo\n\nOnly Premium Users can use This Direct Searching features\n\n✨ Upgrade to the ***Premium Users Plan***', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '💳 View Pʀᴇᴍɪᴜᴍ Plan', callback_data: 'buyprime' }
        ]]
      }
    });
    return;
  }

  const schemaButtons = [
    [{ text: '🍑 Parody Movies 🎬', callback_data: 'schema_parody' }],
    [{ text: '🔥 Viral Videos 📱', callback_data: 'schema_viral' }],
    [{ text: '🌐 Web Series 💻', callback_data: 'schema_webs' }],
    [{ text: '🍿 Full Videos 🎥', callback_data: 'schema_fvideo' }],
  ];

  bot.sendMessage(chatId, 'Please choose a category to see the files:', {
    reply_markup: {
      inline_keyboard: schemaButtons,
    },
  });
});


const paginationState = {}; // Maintain user state

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();
  const data = callbackQuery.data;

  const puser = await P_USERS.findOne({ puserId: userId });
  if (!puser) return;

  if (data.startsWith('schema_')) {
    const schema = data.split('_')[1];
    const videos = cachedVideos[schema] || [];

    if (!videos.length) {
      bot.sendMessage(chatId, `No files found in ${schema} category.`);
      return;
    }

    // Save pagination state
    paginationState[userId] = {
      schema,
      currentPage: 1,
      resultsPerPage: 10,
      totalPages: Math.ceil(videos.length / 10)
    };

    sendCachedResults(bot, callbackQuery.message.message_id, chatId, userId);
    bot.answerCallbackQuery(callbackQuery.id);
  }

  if (data.startsWith('page_')) {
    const [_, action, schema] = data.split('_');

    if (!paginationState[userId] || paginationState[userId].schema !== schema) return;

    if (action === 'next' && paginationState[userId].currentPage < paginationState[userId].totalPages) {
      paginationState[userId].currentPage++;
    } else if (action === 'prev' && paginationState[userId].currentPage > 1) {
      paginationState[userId].currentPage--;
    }

    sendCachedResults(bot, callbackQuery.message.message_id, chatId, userId);
    bot.answerCallbackQuery(callbackQuery.id);
  }
  
  if (data.startsWith('page_goto_')) {
  const schema = data.split('_')[2];

  if (!paginationState[userId] || paginationState[userId].schema !== schema) return;

  const pageInputMessage = await bot.sendMessage(chatId, '📥 Please enter the page number you want to jump to:');

  // Listen to the next message from this user
  bot.once('message', async (msg) => {
    const requestedPage = parseInt(msg.text);
    const totalPages = paginationState[userId].totalPages;

    // Clean up user input messages
    bot.deleteMessage(chatId, msg.message_id);
    bot.deleteMessage(chatId, pageInputMessage.message_id);

    if (!isNaN(requestedPage) && requestedPage > 0 && requestedPage <= totalPages) {
      paginationState[userId].currentPage = requestedPage;
      sendCachedResults(bot, callbackQuery.message.message_id, chatId, userId);
    } else {
      bot.sendMessage(chatId, `❌ Invalid page number. Please enter a number between 1 and ${totalPages}.`);
    }
  });

  bot.answerCallbackQuery(callbackQuery.id);
  return;
}

});
function sendCachedResults(bot, messageId, chatId, userId) {
  const { schema, currentPage, resultsPerPage, totalPages } = paginationState[userId];
  const videos = cachedVideos[schema] || [];

  const start = (currentPage - 1) * resultsPerPage;
  const pageResults = videos.slice(start, start + resultsPerPage);

  const buttons = pageResults.map(file => [{
    text: file.fileName,
    url: `https://t.me/terabox_player_hj_bot?start=file_${file.uniqueId}`
  }]);

  const navButtons = [];

  if (currentPage > 1) {
    navButtons.push({ text: '⬅ Prev', callback_data: `page_prev_${schema}` });
  }

  navButtons.push({ text: `${currentPage}/${totalPages}`, callback_data: 'page_info' });

  if (currentPage < totalPages) {
    navButtons.push({ text: 'Next ➡', callback_data: `page_next_${schema}` });
  }

  // ✅ Add "Go to Page" button
  navButtons.push({ text: '🔢 Go to Page', callback_data: `page_goto_${schema}` });

  if (navButtons.length) buttons.push(navButtons);

  bot.editMessageText(`Results for *${schema}* category:\nPage ${currentPage} of ${totalPages}`, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttons,
    }
  });
}




// /send command handler
bot.onText(/\/send/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is a reply
  if (!msg.reply_to_message) {
    bot.sendMessage(chatId, "Please reply to a message with /send to broadcast it.");
    return;
  }

  // Get the replied message content
  const messageToSend = msg.reply_to_message.text;
 // e.g., 123456789
  if (msg.from.id !== ownerId) {
    bot.sendMessage(chatId, "Only admins can use this command.");
    return;
  }

  try {
    // Fetch all users from the database
    const users = await P_USERS.find({}, 'puserId'); // Only fetch puserId field
    const totalUsers = users.length;

    if (totalUsers === 0) {
      bot.sendMessage(chatId, "No users found in the database.");
      return;
    }

    // Send message to each user
    let successCount = 0;
    for (const user of users) {
      try {
        await bot.sendMessage(user.puserId, messageToSend);
        successCount++;
        // Optional: Add delay to respect Telegram's rate limits (e.g., 30 msg/sec)
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
      } catch (error) {
        console.log(`Failed to send to ${user.puserId}: ${error.message}`);
      }
    }

    bot.sendMessage(chatId, `Message sent to ${successCount} out of ${totalUsers} users.`);
  } catch (error) {
    console.error("Error fetching users:", error);
    bot.sendMessage(chatId, "An error occurred while broadcasting the message.");
  }
});










// Glitch projects ke URLs
const URLs = [
  "https://heartbreaking-puzzle-ounce.glitch.me",
  "https://tb-kilaniyakamal16.onrender.com"
 
];
const TIMEOUT = 30000;  

async function wakeAndPing(URL) {
  try {
    // Pehle URL ko access karo taki project wake ho
    console.log(`🌙 Waking up ${URL}...`);
    await axios.get(URL, { timeout: TIMEOUT });

    // Ab actual ping bhejo
    console.log(`✅ Pinged ${URL} at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error(`❌ Error waking/pinging ${URL}: ${error.message}`);
  }
}

async function pingAll() {
  for (const URL of URLs) {
    wakeAndPing(URL);  // Har URL ke liye wake + ping
  }
}

// Har 3 minute me ping karega
setInterval(pingAll, 180000);

// Serve the index.html file directly when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
  
// Express server for webhook or other purposes
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
