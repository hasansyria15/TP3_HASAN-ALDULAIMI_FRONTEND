<template>
  <div class="home-page">
    <!-- Notification -->
    <Transition name="slide">
      <div v-if="notification.show" class="notification" :class="notification.type">
        <i :class="notification.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1>Bienvenue sur <span>MaLibrairie</span></h1>
        <p>Découvrez notre sélection de livres soigneusement choisis pour vous.</p>
      </div>
    </section>

    <!-- Section Livres -->
    <section class="books-section">
      <div class="container">
        <div class="section-header">
          <h2>Nos Livres</h2>
          <p>Explorez notre catalogue</p>
        </div>

        <!-- Barre de recherche -->
        <div class="search-container">
          <div class="search-bar">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="searchBooks"
              placeholder="Rechercher par titre, auteur..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
              <i class="bi bi-x-lg"></i>
            </button>
            <button @click="searchBooks" class="search-btn">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>

        <!-- Filtres par catégorie -->
        <div v-if="categories.length > 0" class="category-filters">
          <button
            class="category-btn"
            :class="{ active: !selectedCategory }"
            @click="filterCategory(null)"
          >
            Tous
          </button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            class="category-btn"
            :class="{ active: selectedCategory === cat._id }"
            @click="filterCategory(cat._id)"
          >
            {{ cat.nom }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Chargement des livres...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="error-container">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="initBooks" class="btn-retry">Réessayer</button>
        </div>

        <!-- Grille de livres -->
        <div v-else class="books-grid">
          <BookCard
            v-for="book in books"
            :key="book._id"
            :book-id="book._id"
            :titre="book.titre"
            :auteurs="book.auteurs"
            :categories="book.categories"
            :couverture="book.couverture"
            :prix="book.prix"
            :quantite="book.quantite"
            :cart-quantity="getCartQuantity(book._id)"
            @add-to-cart="handleAddToCart"
            @update-quantity="handleUpdateQuantity"
          />
        </div>

        <!-- Aucun livre -->
        <div v-if="!isLoading && !error && books.length === 0" class="empty-container">
          <i class="bi bi-book"></i>
          <p>Aucun livre trouvé.</p>
        </div>

        <!-- Pagination (seulement si pas de filtre catégorie) -->
        <div v-if="!isLoading && !error && books.length > 0 && !selectedCategory" class="pagination">
          <button
            class="btn-page"
            :disabled="currentPage <= 1"
            @click="goToPrevPage"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <div class="page-numbers">
            <button
              v-for="page in displayedPages"
              :key="page"
              class="btn-page-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="btn-page"
            :disabled="currentPage >= totalPages"
            @click="goToNextPage"
          >
            <i class="bi bi-chevron-right"></i>
          </button>

          <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import BookCard from '@/components/BookCard.vue'

const router = useRouter()

// Stores
const booksStore = useBooksStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// État
const books = ref([])
const categories = ref([])
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const selectedCategory = ref(null)

// Notification
const notification = ref({ show: false, message: '', type: 'success' })

/**
 * Initialisation - charge tous les livres
 */
async function initBooks() {
  isLoading.value = true
  error.value = ''
  try {
    await booksStore.fetchAllBooks()
    categories.value = booksStore.categories
    await loadBooks(1)
  } catch (err) {
    error.value = 'Impossible de charger les livres.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Charge les livres avec pagination
 */
async function loadBooks(page = 1, search = '') {
  isLoading.value = true
  error.value = ''
  try {
    await booksStore.fetchBooks(page, search)
    books.value = booksStore.books
    currentPage.value = booksStore.currentPage
    totalPages.value = booksStore.totalPages
  } catch (err) {
    error.value = 'Impossible de charger les livres.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Recherche par titre/auteur
 */
async function searchBooks() {
  selectedCategory.value = null
  if (!searchQuery.value.trim()) {
    await loadBooks(1)
    return
  }
  await loadBooks(1, searchQuery.value)
}

/**
 * Efface la recherche
 */
async function clearSearch() {
  searchQuery.value = ''
  selectedCategory.value = null
  await loadBooks(1)
}

/**
 * Filtre par catégorie
 */
function filterCategory(categoryId) {
  selectedCategory.value = categoryId
  searchQuery.value = ''
  booksStore.filterByCategory(categoryId)
  books.value = booksStore.books
  currentPage.value = booksStore.currentPage
  totalPages.value = booksStore.totalPages
}

/**
 * Pages affichées dans la pagination
 */
const displayedPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)

  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Navigation pagination
async function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    await loadBooks(currentPage.value + 1)
  }
}

async function goToPrevPage() {
  if (currentPage.value > 1) {
    await loadBooks(currentPage.value - 1)
  }
}

async function goToPage(page) {
  if (page !== currentPage.value) {
    await loadBooks(page)
  }
}

/**
 * Ajouter au panier
 */
async function handleAddToCart(bookId) {
  // Vérifier si connecté
  if (!authStore.isAuthenticated) {
    showNotification('Connectez-vous pour ajouter au panier', 'error')
    router.push('/login')
    return
  }

  try {
    await cartStore.addToCart(bookId, 1)
    showNotification('Article ajouté au panier !', 'success')
  } catch (err) {
    showNotification(err.message || 'Erreur lors de l\'ajout', 'error')
  }
}

/**
 * Obtenir la quantité d'un livre dans le panier
 */
function getCartQuantity(bookId) {
  const item = cartStore.items.find(i => i.livre?._id === bookId || i.livre === bookId)
  return item ? item.quantite : 0
}

/**
 * Mettre à jour la quantité dans le panier
 */
async function handleUpdateQuantity({ bookId, quantity }) {
  if (!authStore.isAuthenticated) return

  try {
    if (quantity <= 0) {
      // Supprimer du panier
      await cartStore.removeItem(bookId)
      showNotification('Article retiré du panier', 'success')
    } else {
      // Mettre à jour la quantité
      await cartStore.updateQuantity(bookId, quantity)
    }
  } catch (err) {
    showNotification(err.message || 'Erreur lors de la mise à jour', 'error')
  }
}

/**
 * Afficher une notification
 */
function showNotification(message, type = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Au montage
onMounted(async () => {
  initBooks()
  // Charger le panier si connecté pour afficher les quantités
  if (authStore.isAuthenticated) {
    await cartStore.fetchCart()
  }
})
</script>

<style scoped>
/* Notification */
.notification {
  position: fixed;
  top: 90px;
  right: 20px;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.notification.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  color: #fff;
  padding: 60px 0;
  text-align: center;
}

.hero-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.hero-section h1 span {
  color: #fff;
  border-bottom: 3px solid #fff;
}

.hero-section p {
  font-size: 1.1rem;
  color: #ccc;
  max-width: 500px;
  margin: 0 auto;
}

/* Books Section */
.books-section {
  padding: 50px 0;

}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
}

.section-header p {
  color: #666;
  font-size: 1rem;
}

/* Search Bar */
.search-container {
  max-width: 500px;
  margin: 0 auto 30px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  padding: 4px 8px 4px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-bar:focus-within {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.search-icon {
  color: #999;
  font-size: 1.1rem;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 12px 0;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #aaa;
}

.clear-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #000;
  color: #fff;
}

.search-btn {
  width: 42px;
  height: 42px;
  border: none;
  background: #000;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: #333;
  transform: scale(1.05);
}

/* Category Filters */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
}

.category-btn {
  padding: 8px 20px;
  border: 2px solid #e0e0e0;
  background: #fff;
  color: #333;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: #000;
  color: #000;
}

.category-btn.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Books Grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .books-grid {
    grid-template-columns: 1fr;
  }

  .hero-section h1 {
    font-size: 1.8rem;
  }

  .category-filters {
    gap: 8px;
  }

  .category-btn {
    padding: 6px 14px;
    font-size: 0.85rem;
  }
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
}

/* Error */
.error-container {
  text-align: center;
  padding: 60px 0;
}

.error-container i {
  font-size: 3rem;
  color: #dc2626;
  margin-bottom: 16px;
}

.error-container p {
  color: #666;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 10px 24px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #333;
}

/* Empty */
.empty-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-container p {
  color: #666;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.btn-page {
  width: 40px;
  height: 40px;
  border: 2px solid #000;
  background: #fff;
  color: #000;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #000;
  color: #fff;
}

.btn-page:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.btn-page-number {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #e0e0e0;
  background: #fff;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-page-number:hover {
  border-color: #000;
}

.btn-page-number.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
  margin-left: 16px;
}

@media (max-width: 576px) {
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }

  .page-info {
    width: 100%;
    text-align: center;
    margin-left: 0;
    margin-top: 8px;
  }

  .btn-page, .btn-page-number {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }
}
</style>
