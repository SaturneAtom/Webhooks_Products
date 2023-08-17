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
const init_role = "Hello, I'd like you to pretend you're an SEO copywriter and SEO expert. Don't write instructions or steps.";
async function generateTextWithExponentialBackoff(prompt, maxTokens, temperature) {
  let retryAttempts = 0;
  let delay = INITIAL_DELAY;

  while (retryAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
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
  const productType = req.body.product_type
  const productCategory = req.body.product_category
  const outputFormat = req.body.output_format; // Get the output format from the request
  const outputLanguage = req.body.output_language; // Get the output language from the request

  let generatedTitleText = '';

  let titlePromptText = "";

  if (outputLanguage === 'fr') {
    titlePromptText = "Write title for this product on seven words maximum. Please write in French and use <h1> HTML. Check for spelling mistakes. I want 7 words maximum. It's important to respect the requested length for title.  ";
  } else if (outputLanguage === 'en') {
    titlePromptText = "Write title for this product. Please write in English and use <h1> HTML. I want 7 words maximum. It's important to respect the requested length for title.";
  }

  const Type = `To help you understand the context of my request here is the type of product is ${productType}. Do not write in the result, only take into account`
  const Category = `To help you understand the context of my request here is the category of product is ${productCategory}. Do not write in the result, only take into account`
  
  const titlePrompt = `${titlePromptText}\n${Type}\n${Category}\n${input}`;
  


  generatedTitleText = await generateTextWithExponentialBackoff(titlePrompt, 25, 0.6, outputLanguage);

  // remove double quote and HTML tags if necessary
  const cleanedGeneratedTitleText = generatedTitleText.replace(/<\/?[^>]+(>|$)/g, '').replace(/"/g, '');

  if (outputFormat === 'json') {
    const output = {
      data: {
        title: cleanedGeneratedTitleText
      }
    };

    res.status(200).json(output);
  } else {
    // Return the results with or without HTML formatting
    const htmlResponse = `<h1>${cleanedGeneratedTitleText}</h1>`;
    res.status(200).send(htmlResponse);
  }
});

// Define a route for /meta
app.post('/meta', async (req, res) => {
  const input = req.body.text;
  const productType = req.body.product_type
  const productCategory = req.body.product_category
  const outputFormat = req.body.output_format; // Get the output format from the request
  const outputLanguage = req.body.output_language; // Get the output language from the request

  let generatedMetaDescText = '';

  let metaDescPromptText = "";

  if (outputLanguage === 'fr') {
    metaDescPromptText = "Write a short meta description for this product. Please use <meta> HTML. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Your answer must respect the ideal size of a meta descriptions in french, I want 18 words maximum. It's important to respect the requested length for the meta descriptions. ";
  } else if (outputLanguage === 'en') {
    metaDescPromptText = "Write a short meta description for this product. Please write in English use <meta> HTML. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Your answer must respect the ideal size of a meta descriptions. I want 18 words maximum. It's important to respect the requested length for the meta descriptions.";
  }

  const Type = `To help you understand the context of my request here is the type of product is ${productType}. Do not write in the result, only take into account`
  const Category = `To help you understand the context of my request here is the category of product is ${productCategory}. Do not write in the result, only take into account`
  


  const metaDescPrompt = `${metaDescPromptText}\n${Type}\n${Category}\n${input}`;

  if (outputFormat === 'json' || outputFormat === 'html') {
    generatedMetaDescText = await generateTextWithExponentialBackoff(metaDescPrompt, 150, 0.7, outputLanguage);
  } else {
    generatedMetaDescText = await generateTextWithExponentialBackoff(metaDescPrompt, 150, 0.7, outputLanguage);
  }

  // remove double quotes and HTML tags if necessary
  const cleanedGeneratedMetaDescText = generatedMetaDescText.replace(/<\/?[^>]+(>|$)/g, '').replace(/"/g, '');

  if (outputFormat === 'json') {
    const output = {
      data: {
        metadescription: cleanedGeneratedMetaDescText
      }
    };

    res.status(200).json(output);
  } else {
    // Return the results with or without HTML formatting
    const htmlResponse = `<meta name="description" content="${cleanedGeneratedMetaDescText}">`;
    res.status(200).send(htmlResponse);
  }
});


// Define a route for /list
app.post('/list', async (req, res) => {
  const input = req.body.text;
  const productType = req.body.product_type
  const productCategory = req.body.product_category
  const outputFormat = req.body.output_format;
  const outputLanguage = req.body.output_language;

  let generatedListText = '';

  let listPromptText = "";

  if (outputLanguage === 'fr') {
    listPromptText = "Write only a list of relevant, hard-hitting benefits that highlight the product's strengths. Present it as a list in <ul> and <li> tags. Make sure each benefit is concise, professional, and convincing. Write in French. Maximum 200 words.";
  } else if (outputLanguage === 'en') {
    listPromptText = "Write only a list of relevant, hard-hitting benefits that highlight the product's strengths. Present it as a list in <ul> and <li> tags. Make sure each benefit is concise, professional, and convincing. Write in English. Maximum 200 words.";
  }

  const Type = `Product Type is ${productType}`
  const Category = `Product Category is ${productCategory}`

  const listPrompt = `${listPromptText}\n${Type}\n${Category}\n${input}`; // Add a newline before input

  if (outputFormat === 'json' || outputFormat === 'html') {
    generatedListText = await generateTextWithExponentialBackoff(listPrompt, 300, 0.6, outputLanguage);
  } else {
    generatedListText = await generateTextWithExponentialBackoff(listPrompt, 300, 0.6, outputLanguage);
  }

  // remove double quote and HTML tags if necessary
  const cleanedGeneratedListText = generatedListText
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .replace(/"/g, '')              // Remove double quotes
    .trim();

  const cleanedGeneratedListTextHTML = generatedListText.replace(/"/g, '');

  if (outputFormat === 'json') {
    const benefitsArrayWithoutHTML = cleanedGeneratedListText.split('\n').map(item => item.trim()).filter(item => item !== ''); // Trim each item
    const tableOutputWithoutHTML = benefitsArrayWithoutHTML.map(benefit => ({ benefit }));

    const output = {
      data: {
        list: tableOutputWithoutHTML
      }
    };

    res.status(200).json(output);
  } else {
    // Return the results with or without HTML formatting
    res.status(200).send(cleanedGeneratedListTextHTML);
  }
});

// Define a route for /description
app.post('/description', async (req, res) => {
  const input = req.body.text;
  const productType = req.body.product_type
  const productCategory = req.body.product_category
  const outputFormat = req.body.output_format;
  const outputLanguage = req.body.output_language;

  let generatedDescriptionText = '';

  let descriptionPromptText = "";

  if (outputLanguage === 'fr') {
    descriptionPromptText = "Write a long product description professional, SEO-optimized. The description should be divided into three distinct sections of around 200 words. Write a creative and relevant title for each section use HTML tags <h2> and <p>. Avoid repetition between sections. Please write in French. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Please write in French.";
  } else if (outputLanguage === 'en') {
    descriptionPromptText = "Write a long product description professional, SEO-optimized. The description should be divided into three distinct sections of around 200 words. Write a creative and relevant title for each section use HTML tags <h2> and <p>. Avoid repetition between sections. Please write in English. Check for spelling mistakes. Check spaces between numbers and avoid special characters. Please write in English.";
  }

  const Type = `Product Type is ${productType}`
  const Category = `Product Category is ${productCategory}`

  const descriptionPrompt = `${descriptionPromptText}\n${Type}\n${Category}\n${input}`;

  if (outputFormat === 'json' || outputFormat === 'html') {
    generatedDescriptionText = await generateTextWithExponentialBackoff(descriptionPrompt, 1200, 0.6, outputLanguage);
  } else {
    generatedDescriptionText = await generateTextWithExponentialBackoff(descriptionPrompt, 1200, 0.6, outputLanguage);
  }

  // remove double quote and HTML tags if necessary
  const cleanedGeneratedDescriptionTextHTML = generatedDescriptionText.replace(/"/g, '');

  if (outputFormat === 'json') {
    const output = {
      data: {
        description: cleanedGeneratedDescriptionTextHTML
      }
    };

    res.status(200).json(output);
  } else {
    // Return the results with or without HTML formatting
    const htmlResponse = `<div>${cleanedGeneratedDescriptionTextHTML}</div>`;
    res.status(200).send(htmlResponse);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
