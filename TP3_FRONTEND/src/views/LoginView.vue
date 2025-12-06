<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Header -->
      <div class="card-header">
        <div class="logo">
          <i class="bi bi-book"></i>
        </div>
        <h1>Connexion</h1>
        <p>Accédez à votre compte MaLibrairie</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" novalidate>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model.trim="email"
            :class="{ 'error': emailError }"
            placeholder="votre@email.com"
            required
          />
          <span v-if="emailError" class="error-msg">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :class="{ 'error': passwordError }"
              placeholder=""
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <span v-if="passwordError" class="error-msg">{{ passwordError }}</span>
        </div>

        <div v-if="generalError" class="alert-error">
          <i class="bi bi-exclamation-circle"></i>
          {{ generalError }}
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="card-footer">
        <p>Pas encore de compte ?</p>
        <RouterLink to="/signup">Créer un compte</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const search = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const generalError = ref('')
const isLoading = ref(false)

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return re.test(email)
}

const formIsValid = computed(() => {
  return isValidEmail(email.value) && password.value.length >= 6
})

function validateForm() {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''
  generalError.value = ''

  if (!email.value) {
    emailError.value = 'Email requis'
    isValid = false
  } else if (!isValidEmail(email.value)) {
    emailError.value = 'Email invalide'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Mot de passe requis'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'Minimum 6 caractères'
    isValid = false
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) return

  isLoading.value = true
  generalError.value = ''

  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (error) {
      generalError.value = error.message || 'Identifiants incorrects'

  } finally {
    isLoading.value = false
  }
}

// mettre search dans le store en utilsiant watch
if (search.value) {
  authStore.setSearchQuery(search.value)
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
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

.form-group {
  margin-bottom: 20px;
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

.form-group input::placeholder {
  color: #aaa;
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
  padding: 5px;
}

.toggle-password:hover {
  color: #111;
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
  transform: translateY(-1px);
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
  transition: color 0.2s;
}

.card-footer a:hover {
  color: #555;
}

@media (max-width: 480px) {
  .login-card {
    border-radius: 0;
    box-shadow: none;
  }

  .login-page {
    padding: 0;
    background: white;
  }
}
</style>
