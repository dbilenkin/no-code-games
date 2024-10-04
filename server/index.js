// server/index.js
require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

// Initialize OpenAI API with the apiKey from environment variables
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Function to extract HTML content
function extractHtml(inputStr) {
  const htmlRegex = /<html[\s\S]*?<\/html>/i;
  const match = inputStr.match(htmlRegex);
  return match ? match[0] : null;
}

console.log('Lambda function initialized');

// Your API endpoint
app.post('/generate-game', async (req, res) => {
  const { prompt } = req.body;
  console.log('Received request with prompt:', prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a programming assistant" },
        {
          role: "user",
          content: `Create an HTML/JavaScript game based on the following idea: ${prompt}. 
            The game should include a description and instructions on how to play if applicable, 
            and be as fully functioning as possible. The game should fit in 600px x 400px area.
            The code should be self-contained, include all necessary HTML, CSS, and JavaScript, 
            and be compatible with modern browsers. Do not include any explanations or comments.`,
        },
      ],
    });

    const rawResponse = completion.choices[0].message.content;
    const htmlContent = extractHtml(rawResponse);
    res.json({ code: htmlContent });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating game');
  }
});

// Export the app wrapped with serverless-http
module.exports.handler = serverless(app);
