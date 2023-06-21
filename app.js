const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000; // Set your desired port number

dotenv.config();
const token = process.env.TOKEN;

// Serve static files from the "public" directory
app.use(express.static('public'));

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Parse JSON bodies
app.use(bodyParser.json());

const MAX_RETRY_ATTEMPTS = 5; // Nombre maximal de tentatives de requête
const INITIAL_DELAY = 1000; // Délai initial en millisecondes
const MAX_LOGIN_ATTEMPTS = 3; // Nombre maximal de tentatives de connexion
const EMAIL_PROMPT = "Please provide your email address:";

const userAttempts = new Map(); // Map to track user attempts

async function generateTextWithExponentialBackoff(prompt, maxTokens, temperature) {
  let retryAttempts = 0;
  let delay = INITIAL_DELAY;

  while (retryAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        //model: 'gpt-3.5-turbo',
        model : 'text-davinci-003',
        prompt : prompt,
        /* messages: [
          { role: 'user', content: prompt }
        ], */
        max_tokens: maxTokens,
        temperature: temperature
      }, {
        headers: headers
      });

      const generatedText = response.data.choices[0].message.content.trim();
      return generatedText;
    } catch (error) {
      console.error('Erreur lors de la génération de texte avec ChatGPT:', error);
      retryAttempts++;

      if (retryAttempts === MAX_RETRY_ATTEMPTS) {
        console.error('Nombre maximal de tentatives atteint. Abandon de la requête.');
        throw error;
      }

      console.log('Tentative de requête échouée. Nouvelle tentative dans', delay, 'ms...');
      await sleep(delay);

      // Augmentation du délai selon une temporisation exponentielle
      delay *= 2;
    }
  }
}

// Define a route for your webhook endpoint
app.post('/webhook', async (req, res) => {
  // Extract the JSON elements from the payload
  const input = req.body.input;
  const productType = req.body.product_type;
  const productCategory = req.body.product_category;
  const outputFormat = req.body.output_format;
  const outputLanguage = req.body.output_language;
  const userEmail = req.body.user_email;

  console.log('Input:', input);
  console.log('Product Type:', productType);
  console.log('Product Category:', productCategory);
  console.log('Output Format:', outputFormat);
  console.log('Output Language:', outputLanguage);
  console.log("Création de la fiche produit en cours");

  // Check if the user has exceeded the maximum login attempts
  if (!userAttempts.has(userEmail)) {
    userAttempts.set(userEmail, 1);
  } else {
    const attempts = userAttempts.get(userEmail);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      res.status(400).send('Maximum login attempts exceeded');
      return;
    }
    userAttempts.set(userEmail, attempts + 1);
  }

  // Generate the prompt
  const init_role = "Hi ChatGPT, I want you to pretend to be an SEO copywriting and SEO expert. Your role is to write compelling and professional product descriptions for users looking to buy online. Your expertise, creativity and relevance will be greatly appreciated.";
  const end_product = "Here is a product :";
  const titlePromptText = "Write a compelling, professional product title that will grab the audience's attention at first glance. It must be optimized for SEO. Your response should not exceed seven words in French.";
  const metaDescPromptText = "Craft a compelling and SEO-optimized product meta-description that will captivate online shoppers. In just twenty-five words, highlight the unique attributes of this amazing product. Please write in French.";
  const listPromptText = "Write a list of relevant, hard-hitting benefits that highlight the product's strengths. Present it as a list in <li> tags. Make sure each benefit is concise, professional and convincing. Write in French. Maximum 400 words";
  const descriptionPrompttext = "Write a professional, SEO-optimized product description. The description should be divided into three distinct sections of around 200 words, each focusing on a product benefit or feature. Write a creative and relevant title for each section between two <h2>. Avoid repetition between sections. Please write in French. Check for spelling mistakes and avoid special characters. Please write in French. Thank you for your time!"
  const titlePrompt = `${init_role}${titlePromptText}${end_product}${input} `;
  const metaDescPrompt = `${init_role}${metaDescPromptText}${end_product}${input} `;
  const listPrompt = `${init_role}${listPromptText}${end_product}${input} `;
  const descPrompt = `${init_role}${descriptionPrompttext}${end_product}${input} `;

  const generatedTitleText = await generateTextWithExponentialBackoff(titlePrompt, 300, 0.6);
  const generatedMetaDescText = await generateTextWithExponentialBackoff(metaDescPrompt, 400, 0.5);
  const generatedListText = await generateTextWithExponentialBackoff(listPrompt, 600, 0.6);
  const generatedDescText = await generateTextWithExponentialBackoff(descPrompt, 800, 1);

  let output;

  if (outputFormat === 'html') {
    output = {
      html: `
      <div class="main">
        <h1 class="title">${generatedTitleText}</h1>
        <p class="metadescription">${generatedMetaDescText}</p>
        <ul class="list>${generatedListText}</ul>
        <p class="description>${generatedDescText}</p>
      </div>`
    };
  } else {
    output = {
      data: {
        title: `<h1 class="title">${generatedTitleText}</h1>`,
        metadescription: generatedMetaDescText,
        product_title: '',
        short_description: '',
        description: generatedDescText,
        arguments: [generatedListText]
      }
    };
  }

  console.log(JSON.stringify(output));
  // Send the output as the response
  res.status(200).json(output);
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});

