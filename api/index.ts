import {ChatModelFactory, Site} from "../model";
import {ModelType, PromptToString} from "../model/base";
const axios = require('axios');
const { config } = require('dotenv');
const express = require('express');

const chatModel = new ChatModelFactory();

const getGPTAnswer = async (prompt: string) => {
    const model = ModelType.GPT3p5Turbo;
    const site = Site.Vita;

    if (!prompt) {
        return;
    }
    const chat = chatModel.get(site);
    if (!chat) {
        return;
    }
    const tokenLimit = chat.support(model);
    if (!tokenLimit) {
        return;
    }
    const [content, messages] = PromptToString(prompt, tokenLimit);
    return await chat.ask({prompt: content, messages, model});
}

config()
const app = express()

const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`

app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)

// @ts-ignore
app.post('/new-message', async (req, res) => {
    const { message } = req.body;

    const messageText = message?.text?.trim() || message?.caption;
    const chatId = message?.chat?.id;

    if (!chatId) {
        console.error({message});
        return res.sendStatus(400)
    }

    console.log({message});

    let responseText = 'Something went wrong...'

    if (messageText) {
        try {
            const prompt = `Напиши основную мысль текста: "${messageText}"`;
            responseText = (await getGPTAnswer(prompt))?.content?.replace('Основная мысль текста: ', '')!;
        } catch (e) {
            console.error(e);
        }
    }

    try {
        await axios.post(TELEGRAM_URI, {
            chat_id: chatId,
            text: responseText
        })
        res.send('Done')
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

// @ts-ignore
app.get('/', (req, res) => {
    res.send('ok!');
});

module.exports = app;
