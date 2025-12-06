<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-custom shadow-sm">
      <div class="container">
        <!-- GAUCHE : Logo + Accueil -->
        <div class="d-flex align-items-center">
          <!-- Logo -->
          <RouterLink to="/" class="navbar-brand d-flex align-items-center me-4">
            <div class="brand-icon me-2">
              <i class="bi bi-book-fill"></i>
            </div>
            <span class="fw-bold">MaLibrairie</span>
          </RouterLink>

          <!-- Accueil (visible sur desktop) -->
          <RouterLink to="/" class="nav-link nav-link-custom d-none d-lg-flex">
            <i class="bi bi-house-door me-1"></i>Accueil
          </RouterLink>
        </div>

        <!-- Bouton burger mobile -->
        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- DROITE -->
        <div class="collapse navbar-collapse justify-content-end" id="mainNavbar">
          <!-- Menu mobile -->
          <ul class="navbar-nav d-lg-none mb-2">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link nav-link-custom">
                <i class="bi bi-house-door me-2"></i>Accueil
              </RouterLink>
            </li>
            <!-- Si connecté : liens mobile -->
            <template v-if="isAuthenticated">
              <li class="nav-item">
                <RouterLink to="/profil" class="nav-link nav-link-custom">
                  <i class="bi bi-person me-2"></i>Mon Profil
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/panier" class="nav-link nav-link-custom">
                  <i class="bi bi-cart3 me-2"></i>Mon Panier
                </RouterLink>
              </li>
              <!-- Lien admin -->
              <li v-if="isAdmin" class="nav-item">
                <RouterLink to="/livres/nouveau" class="nav-link nav-link-custom nav-link-admin">
                  <i class="bi bi-plus-circle me-2"></i>Ajouter un livre
                </RouterLink>
              </li>
              <li class="nav-item">
                <button class="nav-link nav-link-logout w-100 text-start" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                </button>
              </li>
            </template>
            <!-- Si NON connecté : liens mobile -->
            <template v-else>
              <li class="nav-item">
                <RouterLink to="/signup" class="nav-link nav-link-custom">
                  <i class="bi bi-person-plus me-2"></i>Inscription
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/login" class="nav-link nav-link-custom">
                  <i class="bi bi-box-arrow-in-right me-2"></i>Connexion
                </RouterLink>
              </li>
            </template>
          </ul>

          <!-- Desktop : boutons à droite -->
          <div class="d-none d-lg-flex gap-2 align-items-center">
            <!-- Si NON connecté -->
            <template v-if="!isAuthenticated">
              <RouterLink to="/signup" class="text-decoration-none">
                <button class="btn btn-outline-custom">
                  <i class="bi bi-person-plus me-1"></i>Inscription
                </button>
              </RouterLink>

              <RouterLink to="/login" class="text-decoration-none">
                <button class="btn btn-primary-custom">
                  <i class="bi bi-box-arrow-in-right me-1"></i>Connexion
                </button>
              </RouterLink>
            </template>

            <!-- Si connecté -->
            <template v-else>
              <!-- Avatar avec dropdown -->
              <div class="dropdown">
                <div
                  class="user-avatar dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  role="button"
                  title="Mon compte"
                >
                  <i class="bi bi-person-fill"></i>
                </div>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <RouterLink to="/profil" class="dropdown-item">
                      <i class="bi bi-person me-2"></i>Mon Profil
                    </RouterLink>
                  </li>
                  <li>
                    <RouterLink to="/panier" class="dropdown-item">
                      <i class="bi bi-cart3 me-2"></i>Mon Panier
                    </RouterLink>
                  </li>
                  <!-- Lien admin -->
                  <li v-if="isAdmin">
                    <RouterLink to="/livres/nouveau" class="dropdown-item dropdown-item-admin">
                      <i class="bi bi-plus-circle me-2"></i>Ajouter un livre
                    </RouterLink>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" @click="logout">
                      <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()


// "Surveiller" le changement de l'état d'authentification
const isAuthenticated = computed(() => authStore.isAuthenticated)

const currentUser = computed(() => authStore.currentUser)

const isAdmin = computed(() => authStore.isAdmin)

const logout = () => {
  authStore.logout()
  router.push('/login')
}


</script>

<style scoped>
.navbar-custom {
  background: #ffffff;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.navbar-brand {
  color: #111 !important;
  font-size: 1.4rem;
  transition: transform 0.2s;
}

.navbar-brand:hover {
  transform: scale(1.02);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #111;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.nav-link-custom {
  color: #555 !important;
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  border-radius: 8px;
  transition: all 0.2s;
  margin: 0 0.2rem;
}

.nav-link-custom:hover {
  color: #111 !important;
  background: #f5f5f5;
}

.nav-link-custom.router-link-active {
  color: #111 !important;
  background: #f0f0f0;
}

.nav-link-logout {
  color: #c62828 !important;
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  border-radius: 8px;
  transition: all 0.2s;
  margin: 0 0.2rem;
  background: transparent;
  border: none;
}

.nav-link-logout:hover {
  color: #b71c1c !important;
  background: #ffebee;
}

.btn-outline-custom {
  color: #111;
  border: 2px solid #ddd;
  background: transparent;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-outline-custom:hover {
  background: #f5f5f5;
  color: #111;
  border-color: #111;
}

.btn-primary-custom {
  background: #111;
  color: white;
  border: 2px solid #111;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary-custom:hover {
  background: #333;
  border-color: #333;
}

.user-info {
  color: #111;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #111;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  background: #333;
  transform: scale(1.05);
}

.user-avatar.dropdown-toggle::after {
  display: none;
}

.dropdown-menu {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 200px;
}

.dropdown-item {
  padding: 0.6rem 1rem;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #111;
}

.dropdown-item.text-danger:hover {
  background: #ffebee;
  color: #c62828;
}

.dropdown-divider {
  margin: 0.3rem 0;
}

.cart-icon {
  font-size: 1.5rem;
  color: #111;
  transition: all 0.2s ease;
  padding: 0.3rem;
}

.cart-icon:hover {
  color: #555;
  transform: scale(1.1);
}

.user-name {
  font-weight: 500;
  color: #111;
}

.btn-logout {
  background: #ffebee;
  color: #c62828;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ffcdd2;
  color: #b71c1c;
}

/* Navbar toggler pour mobile */
.navbar-toggler {
  padding: 0.5rem;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='%23111' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* Responsive */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: #fafafa;
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1rem;
    border: 1px solid #eee;
  }

  .nav-link-custom {
    padding: 0.75rem 1rem !important;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .btn-outline-custom,
  .btn-primary-custom,
  .btn-logout {
    width: 100%;
    justify-content: center;
  }

  .user-info {
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}

/* Style admin */
.nav-link-admin,
.dropdown-item-admin {
  color: #1565c0 !important;
  font-weight: 500;
}

.nav-link-admin:hover,
.dropdown-item-admin:hover {
  background: #e3f2fd !important;
  color: #0d47a1 !important;
}
</style>
