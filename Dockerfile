# Définir l'image de base à utiliser pour notre application
FROM node:14-alpine

# Définir le répertoire de travail
WORKDIR /front

# Copier les fichiers package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier les fichiers de l'application
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
