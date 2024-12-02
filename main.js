import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Fetch the API key securely from Firebase Functions
async function getFirebaseConfig() {
  try {
    const response = await fetch('https://us-central1-recipe-website-b9f83.cloudfunctions.net/getApiKey');  // Correct Firebase Function URL
    const data = await response.json();
    return {
      apiKey: data.apiKey, // The API key returned from your function
      authDomain: "recipe-website-b9f83.firebaseapp.com",
      projectId: "recipe-website-b9f83",
      storageBucket: "recipe-website-b9f83.appspot.com",
      messagingSenderId: "246469319061",
      appId: "1:246469319061:web:ff2bf662e1e9e81375fe9c",
      measurementId: "G-PMVZ1X2EPZ",
    };
  } catch (error) {
    console.error("Error fetching Firebase config: ", error);
  }
}

let app;
let db;
let storage;

// Initialize Firebase dynamically
(async function initializeFirebase() {
  const firebaseConfig = await getFirebaseConfig();
  if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
    // Fetch recipes immediately after Firebase initialization
    fetchRecipes();
    showRecipeDetail(); // If there is a recipe ID in the URL, show it
  } else {
    console.error("Failed to initialize Firebase");
  }
})();

// Elements
const addRecipeButton = document.getElementById("addRecipeButton");
const addRecipeForm = document.getElementById("addRecipeForm");
const closeFormButton = document.querySelector('.close-button');
const submitRecipeButton = document.getElementById("submitRecipeButton");
const recipeList = document.getElementById("recipeList");
const searchBar = document.getElementById('searchBar');

let editingRecipeId = null; // Track if we're editing a recipe
let allRecipes = []; // To store recipes for filtering

// Show the form when "Add Recipe" button is clicked
addRecipeButton.addEventListener("click", () => {
  addRecipeForm.style.display = "block";  // Show the form
  document.getElementById("formTitle").innerText = "Add Recipe";  // Set form title to "Add Recipe"
  editingRecipeId = null; // Reset editing ID when adding a new recipe
  resetForm(); // Reset the form fields
});

// Reset form fields
function resetForm() {
  document.getElementById("recipeTitle").value = '';
  document.getElementById("recipeIngredients").value = '';
  document.getElementById("recipeInstructions").value = '';
}


// Close the form when the close button (X) is clicked
closeFormButton.addEventListener('click', () => {
  addRecipeForm.style.display = 'none';  // Hide the form
});

// Save recipe to Firestore when the submit button is clicked
submitRecipeButton.addEventListener("click", async () => {
  const title = document.getElementById("recipeTitle").value;
  const ingredients = document.getElementById("recipeIngredients").value;
  const instructions = document.getElementById("recipeInstructions").value;

  // Check if required fields are filled
  if (title && ingredients && instructions) {
    try {
      if (editingRecipeId) {
        // If editing, update the existing recipe
        await updateDoc(doc(db, "recipes", editingRecipeId), {
          title: title,
          ingredients: ingredients,
          instructions: instructions,
        });
        console.log("Recipe updated!");
      } else {
        // If not editing, add a new recipe
        await addDoc(collection(db, "recipes"), {
          title: title,
          ingredients: ingredients,
          instructions: instructions,
        });
        console.log("Recipe added!");
      }

      addRecipeForm.style.display = "none";  // Hide form after submission
      fetchRecipes();  // Refresh the list after adding/updating a recipe
    } catch (error) {
      console.error("Error saving recipe: ", error);
    }
  } else {
    console.log("Please fill in all fields.");
  }
});

// Fetch recipes from Firestore
async function fetchRecipes() {
  try {
    const querySnapshot = await getDocs(collection(db, "recipes"));

    // Clear the recipe list before adding new recipes
    recipeList.innerHTML = '';

    // Store recipes for filtering
    allRecipes = [];

    querySnapshot.forEach(doc => {
      const recipe = doc.data();
      const recipeId = doc.id; // Get the document ID
      const recipeUrl = window.location.href + '?recipe=' + recipeId;  // Generate unique URL

      allRecipes.push({
        id: recipeId,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      });

      const li = document.createElement("li");
      li.innerHTML = `
        <h3>${recipe.title}</h3>
        <p><strong>Ingredients:</strong></p>
        <ul>
          ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        <button class="edit-button" data-id="${recipeId}">Edit</button>
        <button class="delete-button" data-id="${recipeId}">Delete</button>
        <button class="share-button" data-url="${recipeUrl}">Share</button> <!-- Share Button -->
      `;

      recipeList.appendChild(li);
    });

    // Add click event listeners to all "Edit", "Delete", and "Share" buttons
    attachButtonEventListeners();
  } catch (error) {
    console.error("Error fetching recipes: ", error);
  }
}

// Function to display the recipe details based on the URL parameter
async function showRecipeDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('recipe');  // Get the 'recipe' parameter from the URL

  if (recipeId) {
    try {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const recipe = docSnap.data();

        // Display the recipe details on the page
        document.body.innerHTML = `
          <h1>${recipe.title}</h1>
          <p><strong>Ingredients:</strong></p>
          <ul>
            ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
          </ul>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
         <button onclick="window.location.href='index.html'">Back to Recipe List</button>`;
      } else {
        console.log("No such recipe!");
        document.body.innerHTML = "<h1>Recipe not found</h1>";
      }
    } catch (error) {
      console.error("Error fetching recipe: ", error);
    }
  }
}

// Edit and delete functions
function attachButtonEventListeners() {
  // Edit button
  document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const recipeId = event.target.getAttribute('data-id');
      const recipe = allRecipes.find(r => r.id === recipeId);

      // Set the form values to the selected recipe details
      document.getElementById("recipeTitle").value = recipe.title;
      document.getElementById("recipeIngredients").value = recipe.ingredients;
      document.getElementById("recipeInstructions").value = recipe.instructions;
      editingRecipeId = recipeId;  // Set the editing ID

      addRecipeForm.style.display = "block";  // Show the form for editing
      document.getElementById("formTitle").innerText = "Edit Recipe";  // Set form title to "Edit Recipe"
    });
  });

  // Delete button
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const recipeId = event.target.getAttribute('data-id');

      // Ask for confirmation before deleting
      const confirmed = confirm("Are you sure you want to delete this recipe?");

      if (confirmed) {
        try {
          await deleteDoc(doc(db, "recipes", recipeId));  // Delete recipe from Firestore
          fetchRecipes();  // Refresh the list after deletion
          alert("Recipe deleted successfully!");
        } catch (error) {
          console.error("Error deleting recipe: ", error);
        }
      }
    });
  });

  // Share button
  document.querySelectorAll('.share-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const url = event.target.getAttribute('data-url');
      navigator.clipboard.writeText(url)  // Copy to clipboard
        .then(() => alert('Shareable link copied!'))
        .catch(err => console.error('Error copying text: ', err));
    });
  });
}

// Search/Filter functionality
searchBar.addEventListener('input', () => {
  const searchTerm = searchBar.value.toLowerCase();

  // Filter the recipes by title or ingredients
  const filteredRecipes = allRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm) || 
    recipe.ingredients.toLowerCase().includes(searchTerm)
  );

  // Clear the list and display filtered recipes
  recipeList.innerHTML = '';
  filteredRecipes.forEach(recipe => {
    const li = document.createElement("li");
    li.innerHTML = `
      <h3>${recipe.title}</h3>
      <p><strong>Ingredients:</strong></p>
      <ul>
        ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
      </ul>
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
      <button class="edit-button" data-id="${recipe.id}">Edit</button>
      <button class="delete-button" data-id="${recipe.id}">Delete</button>
      <button class="share-button" data-url="${window.location.href + '?recipe=' + recipe.id}">Share</button>
    `;
    recipeList.appendChild(li);
  });

  // Reattach event listeners for edit/delete/share buttons
  attachButtonEventListeners();
});
