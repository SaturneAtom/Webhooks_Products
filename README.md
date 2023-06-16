# Webhooks_Products
Génération de fiches produits avec GPT-3.5

Ce projet permet de générer des fiches produits en utilisant l'IA GPT-3.5. Vous pouvez lancer l'application en local ou en utilisant Docker.

## Prérequis

- Node.js
- Docker (optionnel)

## Installation et lancement en local

1. Clonez le dépôt :
git clone https://github.com/user/repo.git
cd repo
2. Installez les dépendances :
npm install
3. Lancez l'application :
npm start
La requête POST sera accessible à l'adresse `http://localhost:3000/webhook`.

## Installation et lancement avec Docker

1. Clonez le dépôt :
git clone https://github.com/user/repo.git
cd repo
2. Construisez l'image Docker :
docker build -t webhook-product .
3. Lancez le conteneur Docker :
docker run -p 3000:3000 --name webhook-product-instance webhook-product
La requête POST sera accessible à l'adresse `http://localhost:3000/webhook

## Utilisation

Une fois l'application lancée, vous pouvez envoyer des requêtes pour générer des fiches produits en utilisant l'API GPT-3.5. Consulter la documentation API pour plus d'informations sur les endpoints et les paramètres disponibles.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou à soumettre des pull requests.

