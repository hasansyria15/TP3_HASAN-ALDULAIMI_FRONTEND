<template>
  <div class="nouveau-livre-page">
    <div class="container">
      <div class="form-container">
        <div class="form-header">
          <h1>Ajouter un nouveau livre</h1>
          <p>Remplissez les informations du livre à ajouter au catalogue</p>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="alert alert-success">
          <i class="bi bi-check-circle"></i>
          {{ successMessage }}
        </div>

        <!-- Message d'erreur général -->
        <div v-if="generalError" class="alert alert-error">
          <i class="bi bi-exclamation-circle"></i>
          {{ generalError }}
        </div>

        <form @submit.prevent="submitForm" class="book-form">
          <!-- Titre -->
          <div class="form-group">
            <label for="titre">Titre <span class="required">*</span></label>
            <input
              type="text"
              id="titre"
              v-model="form.titre"
              :class="{ 'is-invalid': errors.titre }"
              placeholder="Titre du livre"
            />
            <span v-if="errors.titre" class="error-message">{{ errors.titre }}</span>
          </div>

          <!-- Auteurs -->
          <div class="form-group">
            <label for="auteurs">Auteurs (IDs séparés par virgule) <span class="required">*</span></label>
            <input
              type="text"
              id="auteurs"
              v-model="form.auteurs"
              :class="{ 'is-invalid': errors.auteurs }"
              placeholder="Ex: 64a1b2c3d4e5f6g7h8i9j0k1, 64a1b2c3d4e5f6g7h8i9j0k2"
            />
            <span v-if="errors.auteurs" class="error-message">{{ errors.auteurs }}</span>
            <small class="hint">Entrez les IDs des auteurs séparés par des virgules</small>
          </div>

          <!-- Catégories -->
          <div class="form-group">
            <label for="categories">Catégories (IDs séparés par virgule)</label>
            <input
              type="text"
              id="categories"
              v-model="form.categories"
              :class="{ 'is-invalid': errors.categories }"
              placeholder="Ex: 64a1b2c3d4e5f6g7h8i9j0k3"
            />
            <span v-if="errors.categories" class="error-message">{{ errors.categories }}</span>
            <small class="hint">Entrez les IDs des catégories séparés par des virgules (optionnel)</small>
          </div>

          <!-- ISBN -->
          <div class="form-group">
            <label for="isbn">ISBN <span class="required">*</span></label>
            <input
              type="text"
              id="isbn"
              v-model="form.isbn"
              :class="{ 'is-invalid': errors.isbn }"
              placeholder="Ex: 978-2-1234-5678-9"
            />
            <span v-if="errors.isbn" class="error-message">{{ errors.isbn }}</span>
          </div>

          <!-- Éditeur -->
          <div class="form-group">
            <label for="editeur">Éditeur</label>
            <input
              type="text"
              id="editeur"
              v-model="form.editeur"
              :class="{ 'is-invalid': errors.editeur }"
              placeholder="Nom de l'éditeur"
            />
            <span v-if="errors.editeur" class="error-message">{{ errors.editeur }}</span>
          </div>

          <!-- Prix et Quantité en ligne -->
          <div class="form-row">
            <div class="form-group">
              <label for="prix">Prix ($) <span class="required">*</span></label>
              <input
                type="number"
                id="prix"
                v-model.number="form.prix"
                :class="{ 'is-invalid': errors.prix }"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <span v-if="errors.prix" class="error-message">{{ errors.prix }}</span>
            </div>

            <div class="form-group">
              <label for="quantite">Quantité en stock <span class="required">*</span></label>
              <input
                type="number"
                id="quantite"
                v-model.number="form.quantite"
                :class="{ 'is-invalid': errors.quantite }"
                placeholder="0"
                min="0"
              />
              <span v-if="errors.quantite" class="error-message">{{ errors.quantite }}</span>
            </div>
          </div>

          <!-- Couverture -->
          <div class="form-group">
            <label for="couverture">URL de la couverture</label>
            <input
              type="url"
              id="couverture"
              v-model="form.couverture"
              :class="{ 'is-invalid': errors.couverture }"
              placeholder="https://example.com/image.jpg"
            />
            <span v-if="errors.couverture" class="error-message">{{ errors.couverture }}</span>
          </div>


          <!-- Boutons -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="goBack">
              <i class="bi bi-arrow-left"></i>
              Annuler
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <i v-else class="bi bi-plus-circle"></i>
              {{ isSubmitting ? 'Ajout en cours...' : 'Ajouter le livre' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'

const router = useRouter()
const booksStore = useBooksStore()

// État du formulaire
const form = reactive({
  titre: '',
  auteurs: '',
  categories: '',
  isbn: '',
  editeur: '',
  prix: null,
  quantite: null,
  couverture: '',
})

// Erreurs de validation
const errors = reactive({
  titre: '',
  auteurs: '',
  categories: '',
  isbn: '',
  editeur: '',
  prix: '',
  quantite: '',
  couverture: '',
})

const isSubmitting = ref(false)
const generalError = ref('')
const successMessage = ref('')

/**
 * Réinitialise les erreurs
 */
function clearErrors() {
  Object.keys(errors).forEach(key => errors[key] = '')
  generalError.value = ''
}

/**
 * Valide le formulaire côté client
 */
function validateForm() {
  clearErrors()
  let isValid = true

  // Titre requis
  if (!form.titre.trim()) {
    errors.titre = 'Le titre est requis'
    isValid = false
  }

  // Auteurs requis
  if (!form.auteurs.trim()) {
    errors.auteurs = 'Au moins un auteur est requis'
    isValid = false
  }

  // ISBN requis
  if (!form.isbn.trim()) {
    errors.isbn = 'L\'ISBN est requis'
    isValid = false
  }

  // Prix requis et positif
  if (form.prix === null || form.prix === '') {
    errors.prix = 'Le prix est requis'
    isValid = false
  } else if (form.prix < 0) {
    errors.prix = 'Le prix doit être positif'
    isValid = false
  }

  // Quantité requise et positive
  if (form.quantite === null || form.quantite === '') {
    errors.quantite = 'La quantité est requise'
    isValid = false
  } else if (form.quantite < 0) {
    errors.quantite = 'La quantité doit être positive'
    isValid = false
  }

  // URL couverture valide (si fournie)
  if (form.couverture && !isValidUrl(form.couverture)) {
    errors.couverture = 'L\'URL de la couverture n\'est pas valide'
    isValid = false
  }

  return isValid
}

/**
 * Vérifie si une URL est valide
 */
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Convertit une chaîne d'IDs en tableau
 */
function parseIds(str) {
  if (!str.trim()) return []
  return str.split(',').map(id => id.trim()).filter(id => id)
}

/**
 * Soumet le formulaire
 */
async function submitForm() {
  if (!validateForm()) return

  isSubmitting.value = true
  generalError.value = ''
  successMessage.value = ''

  try {
    // Préparer les données
    const bookData = {
      titre: form.titre.trim(),
      auteurs: parseIds(form.auteurs),
      isbn: form.isbn.trim(),
      prix: Number(form.prix),
      quantite: Number(form.quantite)
    }

    // Champs optionnels
    if (form.categories.trim()) {
      bookData.categories = parseIds(form.categories)
    }
    if (form.editeur.trim()) {
      bookData.editeur = form.editeur.trim()
    }
    if (form.datePublication) {
      bookData.datePublication = form.datePublication
    }
    if (form.couverture.trim()) {
      bookData.couverture = form.couverture.trim()
    }
    if (form.resume.trim()) {
      bookData.resume = form.resume.trim()
    }

    await booksStore.createBook(bookData)

    successMessage.value = 'Livre ajouté avec succès !'

    // Rediriger vers la page d'accueil après 1.5s
    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (err) {
    // Gérer les erreurs de validation de l'API
    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach(error => {
        const field = error.path || error.param
        if (field && errors.hasOwnProperty(field)) {
          errors[field] = error.msg || error.message
        }
      })
    } else if (err.message) {
      generalError.value = err.message
    } else {
      generalError.value = 'Une erreur est survenue lors de l\'ajout du livre'
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Retour à la page précédente
 */
function goBack() {
  router.back()
}
</script>

<style scoped>
.nouveau-livre-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  padding: 40px 20px;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

.form-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: #000;
  color: #fff;
  padding: 30px;
  text-align: center;
}

.form-header h1 {
  margin: 0 0 10px;
  font-size: 1.8rem;
  font-weight: 700;
}

.form-header p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
}

.book-form {
  padding: 30px;
}

/* Alertes */
.alert {
  padding: 14px 18px;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Groupes de formulaire */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #c62828;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #000;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.form-group input.is-invalid,
.form-group textarea.is-invalid {
  border-color: #c62828;
  background: #fff5f5;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  display: block;
  color: #c62828;
  font-size: 0.85rem;
  margin-top: 6px;
}

.hint {
  display: block;
  color: #757575;
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Ligne de formulaire (prix + quantité) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 500px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Boutons */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #fff;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-cancel:hover {
  border-color: #000;
  background: #f5f5f5;
}

.btn-submit {
  background: #000;
  color: #fff;
  border: 2px solid #000;
}

.btn-submit:hover:not(:disabled) {
  background: #333;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .nouveau-livre-page {
    padding: 20px 15px;
  }

  .form-header {
    padding: 25px 20px;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }

  .book-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .alert {
    margin: 15px 20px 0;
  }
}
</style>
