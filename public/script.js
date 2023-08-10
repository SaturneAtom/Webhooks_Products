// Récupération des éléments du DOM
/* const inputForm = document.getElementById('inputForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('responseContainer');

// Ajout d'un gestionnaire d'événement pour la soumission du formulaire
inputForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Récupération de la valeur saisie par l'utilisateur
  const input = userInput.value;

  // Envoi de la requête à l'API
  axios
    .post('/webhook', { input })
    .then((response) => {
      // Récupération de la réponse du serveur
      const responseData = response.data;

      // Affichage progressif de la réponse
      typeEffect(responseContainer, responseData, 75); // ajustez la vitesse en fonction de vos préférences
    })
    .catch((error) => {
      // Gestion des erreurs
      console.error('Erreur lors de la requête au serveur:', error);
    });
});

// Fonction pour l'affichage progressif de la réponse
function typeEffect(element, responseData, speed) {
  const { data } = responseData;
  const { title, metadescription, arguments: benefits, description } = data;

  element.innerHTML = ''; // Réinitialisation du contenu

  // Affichage progressif du titre
  let i = 0;
  const titleTimer = setInterval(function () {
    if (i < title.length) {
      element.append(title.charAt(i));
      i++;
    } else {
      clearInterval(titleTimer);
      element.innerHTML += '<br><br>'; // Ajouter des sauts de ligne après le titre
      typeBenefits(0); // Démarrer l'affichage progressif des avantages
    }
  }, speed);

  // Fonction pour l'affichage progressif des avantages
  function typeBenefits(index) {
    if (index < benefits.length) {
      const benefit = benefits[index];
      let j = 0;
      const benefitTimer = setInterval(function () {
        if (j < benefit.length) {
          element.append(benefit.charAt(j));
          j++;
        } else {
          clearInterval(benefitTimer);
          element.innerHTML += '<br>'; // Ajouter un saut de ligne après chaque avantage
          typeBenefits(index + 1); // Passer à l'avantage suivant
        }
      }, speed);
    } else {
      // Une fois que tous les avantages sont affichés, afficher la description
      element.innerHTML += '<br><br>';
      let k = 0;
      const descriptionTimer = setInterval(function () {
        if (k < description.length) {
          element.append(description.charAt(k));
          k++;
        } else {
          clearInterval(descriptionTimer);
        }
      }, speed);
    }
  }
}

// Application
const speed = 75;
const h1 = document.querySelector('h1');
const p = document.querySelector('p');
const delay = h1.innerHTML.length * speed + speed;

// Affichage progressif du titre
typeEffect(h1, speed);

// Affichage progressif du paragraphe après un délai
setTimeout(function(){
  p.style.display = "inline-block";
  typeEffect(p, speed);
}, delay);
*/
function typeEffect(element, text, speed) {
  element.innerHTML = "";

  var i = 0;
  var timer = setInterval(function () {
    if (i < text.length) {
      element.append(text.charAt(i));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

document.addEventListener("DOMContentLoaded", function () {
  var button = document.getElementById("submitButton");
  var textarea = document.getElementById("inputText");
  var responseContainer = document.getElementById("responseContainer");

  button.addEventListener("click", function () {
    var text = textarea.value;
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/webhook";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        responseContainer.classList.remove("hidden");

        // Traitement de la réponse JSON
        var generatedTitleText = jsonResponse.data.title;
        var generatedMetaDescText = jsonResponse.data.metadescription;
        var generatedListText = jsonResponse.data.arguments[0];
        var generatedDescText = jsonResponse.data.description;

        var htmlResponse = `
          <div class="main">
            <h1 class="title">${generatedTitleText}</h1>
            <p class="metadescription">${generatedMetaDescText}</p>
            <ul class="list>${generatedListText}</ul>
            <p class="description>${generatedDescText}</p>
          </div>`;

        var responseElement = document.createElement("div");
        responseElement.innerHTML = htmlResponse;
        responseContainer.appendChild(responseElement);

        // Appliquer l'effet d'écriture progressive aux éléments
        var elementsToType = responseElement.querySelectorAll(".title, .metadescription, .list, .description");
        var speed = 75;

        elementsToType.forEach(function (element) {
          typeEffect(element, element.innerHTML, speed);
        });
      }
    };

    var data = JSON.stringify({ text: text });
    xhr.send(data);
  });
});
