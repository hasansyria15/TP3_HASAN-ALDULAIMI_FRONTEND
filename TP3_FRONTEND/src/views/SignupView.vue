<template>
  <div class="signup-page">
    <div class="signup-card">
      <!-- Header -->
      <div class="card-header">
        <div class="logo">
          <i class="bi bi-person-plus"></i>
        </div>
        <h1>Inscription</h1>
        <p>Créez votre compte MaLibrairie</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" novalidate>
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            v-model.trim="form.username"
            :class="{ 'error': errors.username }"
            placeholder="johndoe"
            required
          />
          <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="first_name">Prénom</label>
            <input
              type="text"
              id="first_name"
              v-model.trim="form.first_name"
              :class="{ 'error': errors.first_name }"
              placeholder="John"
              required
            />
            <span v-if="errors.first_name" class="error-msg">{{ errors.first_name }}</span>
          </div>

          <div class="form-group">
            <label for="last_name">Nom</label>
            <input
              type="text"
              id="last_name"
              v-model.trim="form.last_name"
              :class="{ 'error': errors.last_name }"
              placeholder="Doe"
              required
            />
            <span v-if="errors.last_name" class="error-msg">{{ errors.last_name }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model.trim="form.email"
            :class="{ 'error': errors.email }"
            placeholder="john@email.com"
            required
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              :class="{ 'error': errors.password }"
              placeholder="Minimum 6 caractères"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirmer le mot de passe</label>
          <div class="password-input">
            <input
              :type="showPasswordConfirm ? 'text' : 'password'"
              id="password_confirmation"
              v-model="form.password_confirmation"
              :class="{ 'error': errors.password_confirmation }"
              placeholder="Répétez le mot de passe"
              required
            />
            <button type="button" class="toggle-password" @click="showPasswordConfirm = !showPasswordConfirm">
              <i :class="showPasswordConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password_confirmation" class="error-msg">{{ errors.password_confirmation }}</span>
        </div>

        <div v-if="generalError" class="alert-error">
          <i class="bi bi-exclamation-circle"></i>
          {{ generalError }}
        </div>

        <div v-if="successMessage" class="alert-success">
          <i class="bi bi-check-circle"></i>
          {{ successMessage }}
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Créer mon compte</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="card-footer">
        <p>Déjà un compte ?</p>
        <RouterLink to="/login">Se connecter</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const API = import.meta.env.VITE_API_URL

const form = reactive({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = reactive({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const generalError = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return re.test(email)
}

const formIsValid = computed(() => {
  return (
    form.username.length >= 3 &&
    form.first_name.length >= 1 &&
    form.last_name.length >= 1 &&
    isValidEmail(form.email) &&
    form.password.length >= 6 &&
    form.password === form.password_confirmation
  )
})

function resetErrors() {
  Object.keys(errors).forEach(key => errors[key] = '')
  generalError.value = ''
}

function validateForm() {
  resetErrors()
  let isValid = true

  if (!form.username || form.username.length < 3) {
    errors.username = 'Minimum 3 caractères'
    isValid = false
  }
  if (!form.first_name) {
    errors.first_name = 'Prénom requis'
    isValid = false
  }
  if (!form.last_name) {
    errors.last_name = 'Nom requis'
    isValid = false
  }
  if (!form.email) {
    errors.email = 'Email requis'
    isValid = false
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Email invalide'
    isValid = false
  }
  if (!form.password) {
    errors.password = 'Mot de passe requis'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Minimum 6 caractères'
    isValid = false
  }
  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Les mots de passe ne correspondent pas'
    isValid = false
  }

  return isValid
}




const authStore = useAuthStore()

async function submitForm() {
    if (!validateForm()) return

    isLoading.value = true
    generalError.value = ''
    successMessage.value = ''
    try {
        // Inscription
        await authStore.Signup({
            username: form.username,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password,
        })

        // Connexion automatique après inscription
        await authStore.login({
            email: form.email,
            password: form.password,
        })

        // Redirection vers l'accueil
        router.push('/')
    } catch (error) {
        generalError.value = error.message || 'Erreur lors de l\'inscription'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.signup-page {
  margin-top: 10%;
  min-height: 100h;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-header {
  text-align: center;
  padding: 40px 30px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  width: 60px;
  height: 60px;
  background: #111;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.logo i {
  font-size: 28px;
  color: white;
}

.card-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin: 0 0 8px;
}

.card-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.2s;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #111;
  background: white;
}

.form-group input.error {
  border-color: #e53935;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.error-msg {
  display: block;
  font-size: 12px;
  color: #e53935;
  margin-top: 6px;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #ffebee;
  border-radius: 10px;
  color: #c62828;
  font-size: 14px;
  margin-bottom: 20px;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #e8f5e9;
  border-radius: 10px;
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: #111;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #333;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-footer {
  text-align: center;
  padding: 20px 30px 30px;
  border-top: 1px solid #f0f0f0;
}

.card-footer p {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px;
}

.card-footer a {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
