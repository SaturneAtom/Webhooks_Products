const express = require('express');
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000; // Set your desired port number

dotenv.config();
const token = process.env.TOKEN;

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.json());
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
const INITIAL_DELAY = 0; // Délai initial en millisecondes
const init_role = "Hello, I'd like you to pretend you're an SEO copywriter and SEO expert. Your role is to write compelling and professional product descriptions for users looking to buy online. Your expertise, creativity and relevance will be greatly appreciated. Write the text in French. Don't write instructions or steps.";
async function generateTextWithExponentialBackoff(prompt, maxTokens, temperature) {
  let retryAttempts = 0;
  let delay = INITIAL_DELAY;

  while (retryAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: init_role },
          { role: 'user', content: prompt }
        ],
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

// Define a route for /title
app.post('/title', async (req, res) => {
  const input = req.body.text;

  
  const titlePromptText = "Write a creative and relevant title for this product. Please write in French and use <h1> HTML. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Your answer must respect the ideal size of a title, seven words. ";
  
  const titlePrompt = `${titlePromptText}${input} `;

  const generatedTitleText = await generateTextWithExponentialBackoff(titlePrompt, 300, 0.6);

  const cleanedGeneratedTitleText = generatedTitleText.replace(/"/g, ''); // Remove double quotes

  const output = {
    data: {
      title: cleanedGeneratedTitleText
    }
  };

  res.status(200).json(output);
});

// Define a route for /metadescription
app.post('/metadescription', async (req, res) => {
  const input = req.body.text;
  const metaDescPromptText = "Write a meta description for this product. Please write in French use <meta> HTML. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Your answer must respect the ideal size of a meta description, 150 characters. ";
  const metaDescPrompt = `${metaDescPromptText}${input} `;

  const generatedMetaDescText = await generateTextWithExponentialBackoff(metaDescPrompt, 400, 0.5);

  // remove double quote
  const cleanedGeneratedMetaDescText = generatedMetaDescText.replace(/"/g, '');

  const output = {
    data: {
      metadescription: cleanedGeneratedMetaDescText
    }
  };

  res.status(200).json(output);
});

// Define a route for /list
app.post('/list', async (req, res) => {
  const input = req.body.text;
  const listPromptText = "Write a list of relevant, hard-hitting benefits that highlight the product's strengths. Present it as a list in <ul> and <li> tags. Make sure each benefit is concise, professional, and convincing. Write in French. Maximum 200 words.";
  const listPrompt = `${listPromptText}${input} `;

  const generatedListText = await generateTextWithExponentialBackoff(listPrompt, 600, 0.6);

  // remove double quote
  const cleanedGeneratedListText = generatedListText.replace(/"/g, '');

  const output = {
    data: {
      list: cleanedGeneratedListText
    }
  };

  res.status(200).json(output);
});

// ... (continue with other routes if needed)
app.post('/description', async (req, res) => {
  const input = req.body.text;
  const descriptionPromptText = "Write a professional, SEO-optimized product description. The description should be divided into three distinct sections of around 200 words, each focusing on a product benefit or feature. Write a creative and relevant title for each section, between two <h2>. Avoid repetition between sections and use <p> HTML. Please write in French. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Please write in French.";
  const descriptionPrompt = `${descriptionPromptText}${input} `;

  const generatedDescriptionText = await generateTextWithExponentialBackoff(descriptionPrompt, 600, 0.6);

  // remove double quote
  const cleanedGeneratedDescriptionText = generatedDescriptionText.replace(/"/g, '');
  console.log('generatedDescriptionText:', cleanedGeneratedDescriptionText);

  const output = {
    data: {
      description: cleanedGeneratedDescriptionText
    }
  };

  res.status(200).json(output);
})

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
