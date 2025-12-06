<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-card">
        <!-- Header -->
        <div class="profile-header">
          <div class="avatar">
            <!-- Photo de profil si disponible -->
            <img
              v-if="profile?.avatar"
              :src="profile.avatar"
              alt="Avatar"
              class="avatar-img"
            />
            <!-- Initiales si pas de photo -->
            <span v-else-if="profile?.first_name || profile?.last_name" class="avatar-initials">
              {{ getInitials }}
            </span>
            <!-- Icône par défaut -->
            <i v-else class="bi bi-person-fill"></i>
          </div>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles</p>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="error-container">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="loadProfile" class="btn-retry">Réessayer</button>
        </div>

        <!-- Contenu du profil -->
        <div v-else-if="profile" class="profile-content">
          <!-- Mode Affichage -->
          <div v-if="!isEditing" class="profile-info">
            <div class="info-group">
              <label>Nom d'utilisateur</label>
              <p>{{ profile.username }}</p>
            </div>
            <div class="info-group">
              <label>Email</label>
              <p>{{ profile.email }}</p>
            </div>
            <div class="info-row">
              <div class="info-group">
                <label>Prénom</label>
                <p>{{ profile.first_name || '-' }}</p>
              </div>
              <div class="info-group">
                <label>Nom</label>
                <p>{{ profile.last_name || '-' }}</p>
              </div>
            </div>

            <div class="profile-actions">
              <button @click="startEditing" class="btn-edit">
                <i class="bi bi-pencil me-2"></i>Modifier
              </button>
              <button @click="showDeleteModal = true" class="btn-delete">
                <i class="bi bi-trash me-2"></i>Supprimer le compte
              </button>
            </div>
          </div>

          <!-- Mode Édition -->
          <form v-else @submit.prevent="saveProfile" class="profile-form">
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                v-model="editForm.username"
                class="form-input"
                disabled
              />
              <small class="text-muted">Le nom d'utilisateur ne peut pas être modifié</small>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="editForm.email"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="first_name">Prénom</label>
                <input
                  type="text"
                  id="first_name"
                  v-model="editForm.first_name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="last_name">Nom</label>
                <input
                  type="text"
                  id="last_name"
                  v-model="editForm.last_name"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelEditing" class="btn-cancel">
                Annuler
              </button>
              <button type="submit" class="btn-save" :disabled="isSaving">
                <span v-if="isSaving">
                  <span class="spinner-small"></span> Enregistrement...
                </span>
                <span v-else>
                  <i class="bi bi-check-lg me-2"></i>Enregistrer
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h3>Supprimer votre compte ?</h3>
        <p>Cette action est irréversible. Toutes vos données seront supprimées définitivement.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">Annuler</button>
          <button @click="deleteAccount" class="btn-confirm-delete" :disabled="isDeleting">
            <span v-if="isDeleting">Suppression...</span>
            <span v-else>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// État
const profile = ref(null)
const isLoading = ref(false)
const error = ref('')
const isEditing = ref(false)
const isSaving = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Formulaire d'édition
const editForm = reactive({
  username: '',
  email: '',
  first_name: '',
  last_name: ''
})

/**
 * Obtenir les initiales de l'utilisateur
 */
const getInitials = computed(() => {
  const first = profile.value?.first_name?.[0] || ''
  const last = profile.value?.last_name?.[0] || ''
  return (first + last).toUpperCase() || '?'
})

/**
 * Charger le profil
 */
async function loadProfile() {
  isLoading.value = true
  error.value = ''
  try {
    const data = await userStore.fetchProfile()
    profile.value = data
  } catch (err) {
    error.value = err.message || 'Impossible de charger le profil'
  } finally {
    isLoading.value = false
  }
}

/**
 * Passer en mode édition
 */
function startEditing() {
  editForm.username = profile.value.username
  editForm.email = profile.value.email
  editForm.first_name = profile.value.first_name || ''
  editForm.last_name = profile.value.last_name || ''
  isEditing.value = true
}

/**
 * Annuler l'édition
 */
function cancelEditing() {
  isEditing.value = false
}

/**
 * Sauvegarder les modifications
 */
async function saveProfile() {
  isSaving.value = true
  try {
    const data = await userStore.updateProfile({
      email: editForm.email,
      first_name: editForm.first_name,
      last_name: editForm.last_name
    })
    profile.value = data
    isEditing.value = false
  } catch (err) {
    alert(err.message || 'Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

/**
 * Supprimer le compte
 */
async function deleteAccount() {
  isDeleting.value = true
  try {
    await userStore.deleteProfile()
    authStore.logout()
    router.push('/')
  } catch (err) {
    alert(err.message || 'Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* Header */
.profile-header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  color: #fff;
  padding: 40px 30px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #fff;
  color: #111;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 16px;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 1.8rem;
  font-weight: 700;
}

.profile-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-header p {
  color: #ccc;
  font-size: 0.95rem;
}

/* Content */
.profile-content {
  padding: 30px;
}

/* Info Display */
.profile-info .info-group {
  margin-bottom: 20px;
}

.profile-info .info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-group label {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 4px;
  font-weight: 500;
}

.info-group p {
  font-size: 1.1rem;
  color: #111;
  font-weight: 500;
  margin: 0;
}

/* Actions */
.profile-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-edit {
  flex: 1;
  padding: 12px 20px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #333;
}

.btn-delete {
  padding: 12px 20px;
  background: #fff;
  color: #c62828;
  border: 2px solid #ffcdd2;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #ffebee;
  border-color: #c62828;
}

/* Form */
.profile-form .form-group {
  margin-bottom: 20px;
}

.profile-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #111;
}

.form-input:disabled {
  background: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.text-muted {
  color: #888;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  flex: 1;
  padding: 12px 20px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #333;
}

.btn-save:disabled {
  background: #888;
  cursor: not-allowed;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 30px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-container {
  text-align: center;
  padding: 60px 30px;
}

.error-container i {
  font-size: 3rem;
  color: #c62828;
  margin-bottom: 16px;
}

.btn-retry {
  padding: 10px 24px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  background: #ffebee;
  color: #c62828;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 20px;
}

.modal-content h3 {
  font-size: 1.3rem;
  color: #111;
  margin-bottom: 12px;
}

.modal-content p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn-cancel {
  flex: 1;
}

.btn-confirm-delete {
  flex: 1;
  padding: 12px 20px;
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #b71c1c;
}

/* Responsive */
@media (max-width: 576px) {
  .profile-header {
    padding: 30px 20px;
  }

  .profile-content {
    padding: 20px;
  }

  .profile-info .info-row,
  .profile-form .form-row {
    grid-template-columns: 1fr;
  }

  .profile-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
