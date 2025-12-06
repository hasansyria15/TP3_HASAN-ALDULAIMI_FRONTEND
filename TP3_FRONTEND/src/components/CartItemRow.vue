<template>
  <div class="cart-item-row">
    <!-- Image du livre -->
    <div class="item-image">
      <img
        v-if="item.livre?.couverture"
        :src="item.livre.couverture"
        :alt="item.livre.titre"
      />
      <div v-else class="no-image">
        <i class="bi bi-book"></i>
      </div>
    </div>

    <!-- Infos du livre -->
    <div class="item-info">
      <h4 class="item-title">{{ item.livre?.titre || 'Titre inconnu' }}</h4>
      <p class="item-author">{{ auteurPrincipal }}</p>
      <p class="item-price">{{ formatPrice(item.prix || item.livre?.prix) }} / unité</p>
    </div>

    <!-- Quantité -->
    <div class="item-quantity">
      <button
        class="qty-btn"
        @click="decreaseQuantity"
        :disabled="item.quantite <= 1 || isUpdating"
      >
        <i class="bi bi-dash"></i>
      </button>
      <span class="qty-value">{{ item.quantite }}</span>
      <button
        class="qty-btn"
        @click="increaseQuantity"
        :disabled="isUpdating || maxStock <= 0"
      >
        <i class="bi bi-plus"></i>
      </button>
    </div>

    <!-- Sous-total -->
    <div class="item-subtotal">
      <span class="subtotal-label">Sous-total</span>
      <span class="subtotal-value">{{ formatPrice(sousTotal) }}</span>
    </div>

    <!-- Bouton supprimer -->
    <button
      class="btn-remove"
      @click="$emit('remove', item.livre?._id || item.livreId)"
      :disabled="isUpdating"
      title="Retirer du panier"
    >
      <i class="bi bi-trash"></i>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-quantity', 'remove'])

const isUpdating = ref(false)

/**
 * Auteur principal du livre
 */
const auteurPrincipal = computed(() => {
  const auteurs = props.item.livre?.auteurs
  if (!auteurs || auteurs.length === 0) return 'Auteur inconnu'
  const premier = auteurs[0]
  return typeof premier === 'object' ? premier.nom : premier
})

/**
 * Stock maximum disponible
 */
const maxStock = computed(() => {
  return props.item.livre.quantite
})

/**
 * Sous-total de la ligne
 */
const sousTotal = computed(() => {
  const prix = props.item.prix || props.item.livre?.prix || 0
  return prix * props.item.quantite
})

/**
 * Formater le prix
 */
function formatPrice(price) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(price || 0)
}

/**
 * Diminuer la quantité
 */
async function decreaseQuantity() {
  if (props.item.quantite > 1) {
    isUpdating.value = true
    emit('update-quantity', props.item.livre?._id || props.item.livreId, props.item.quantite - 1)
    setTimeout(() => isUpdating.value = false, 500)
  }
}

/**
 * Augmenter la quantité
 */
async function increaseQuantity() {
  if (props.item.quantite < maxStock.value) {
    isUpdating.value = true
    emit('update-quantity', props.item.livre?._id || props.item.livreId, props.item.quantite + 1)
    setTimeout(() => isUpdating.value = false, 500)
  }
}
</script>

<style scoped>
.cart-item-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.cart-item-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Image */
.item-image {
  width: 80px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 2rem;
}

/* Info */
.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-author {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 4px;
}

.item-price {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

/* Quantité */
.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  color: #111;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #111;
  color: #fff;
}

.qty-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  color: #111;
}

/* Sous-total */
.item-subtotal {
  text-align: right;
  min-width: 100px;
}

.subtotal-label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 2px;
}

.subtotal-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
}

/* Bouton supprimer */
.btn-remove {
  width: 40px;
  height: 40px;
  border: none;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove:hover:not(:disabled) {
  background: #c62828;
  color: #fff;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-item-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .item-image {
    width: 60px;
    height: 75px;
  }

  .item-info {
    flex: 1 1 calc(100% - 80px);
  }

  .item-quantity {
    order: 4;
  }

  .item-subtotal {
    order: 5;
    flex: 1;
    text-align: left;
  }

  .btn-remove {
    order: 6;
  }
}

@media (max-width: 480px) {
  .cart-item-row {
    padding: 16px;
  }

  .item-info {
    flex: 1 1 100%;
  }

  .item-subtotal {
    text-align: right;
  }
}
</style>
