# Implémentation API - Gestion des Erreurs et Authentification

## 📋 Vue d'ensemble

Cette implémentation assure une gestion complète des appels API avec :
- ✅ En-tête `Authorization: Bearer <token>` pour les routes protégées
- ✅ Gestion des codes de statut HTTP (200/201/204/400/401/404/409/422)
- ✅ Traitement des erreurs du middleware d'erreurs de l'API

## 🔐 Authentification

### En-tête Authorization

Toutes les routes protégées utilisent l'en-tête d'authentification :

```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
}
```

### Routes protégées

Les routes suivantes nécessitent un token d'authentification :

**Livres**
- `POST /api/livres` - Créer un livre (admin uniquement)

**Panier**
- `GET /api/panier` - Récupérer le panier
- `POST /api/panier` - Ajouter/Mettre à jour un article
- `DELETE /api/panier/items/:id` - Retirer un article
- `DELETE /api/panier` - Vider le panier

**Profil utilisateur**
- `GET /api/users/profile` - Récupérer le profil
- `PUT /api/users/profile` - Modifier le profil
- `DELETE /api/users/profile` - Supprimer le compte

## 📊 Codes de Statut HTTP

### Succès

| Code | Utilisation | Exemple |
|------|-------------|---------|
| **200 OK** | Requête réussie avec données | GET livres, GET panier |
| **201 Created** | Ressource créée avec succès | POST signup, POST livre |
| **204 No Content** | Succès sans contenu de réponse | DELETE panier, DELETE compte |

### Erreurs Client (4xx)

| Code | Signification | Gestion |
|------|---------------|---------|
| **400 Bad Request** | Requête invalide | Affichage des détails d'erreur |
| **401 Unauthorized** | Non authentifié ou token invalide | Redirection vers login, suppression du token |
| **404 Not Found** | Ressource introuvable | Message d'erreur clair |
| **409 Conflict** | Conflit avec ressource existante | Affichage du conflit (ex: email déjà utilisé) |
| **422 Unprocessable Entity** | Erreur de validation | Affichage des erreurs de validation par champ |

### Erreurs Serveur (5xx)

| Code | Signification | Gestion |
|------|---------------|---------|
| **500 Internal Server Error** | Erreur serveur | Message générique, invitation à réessayer |

## 🛠️ Fichiers modifiés

### `/src/utils/api.js` (nouveau)

Utilitaires centralisés pour les appels API :

**Fonctions principales :**
- `getToken()` - Récupère le token depuis localStorage
- `getAuthHeaders()` - Crée les headers avec authentification
- `handleHttpError(response)` - Gère les erreurs HTTP selon le code de statut
- `apiGet(endpoint, requiresAuth)` - Requête GET
- `apiPost(endpoint, data, requiresAuth)` - Requête POST
- `apiPut(endpoint, data, requiresAuth)` - Requête PUT
- `apiDelete(endpoint, requiresAuth)` - Requête DELETE

**Gestion des erreurs :**
```javascript
// Structure de l'erreur retournée
error.message   // Message d'erreur formaté
error.status    // Code de statut HTTP
error.details   // Détails additionnels
error.errors    // Tableau d'erreurs de validation (pour 422)
```

### `/src/stores/auth.js`

**Mise à jour :**
- Import de `handleHttpError` pour une gestion d'erreurs cohérente
- Ajout de try-catch autour des décodages JWT
- Documentation des codes de statut attendus

**Méthodes :**
- `Signup()` - Status attendu: **201 Created**
- `login()` - Status attendu: **200 OK**

### `/src/stores/books.js`

**Mise à jour :**
- Import des utilitaires API
- `createBook()` avec Authorization Bearer et gestion d'erreurs améliorée
- Status attendu: **201 Created**

### `/src/stores/cart.js`

**Mise à jour :**
- Utilisation de `getAuthHeaders()` pour tous les appels
- Gestion d'erreurs avec `handleHttpError()`

**Méthodes :**
- `fetchCart()` - Status: **200 OK**
- `addToCart()` - Status: **201 Created**
- `updateQuantity()` - Status: **200 OK** ou **201 Created**
- `removeItem()` - Status: **204 No Content** ou **200 OK**
- `clearCart()` - Status: **204 No Content** ou **200 OK**

### `/src/stores/user.js`

**Mise à jour :**
- Utilisation de `getAuthHeaders()` pour tous les appels
- Gestion d'erreurs avec `handleHttpError()`

**Méthodes :**
- `fetchProfile()` - Status: **200 OK**
- `updateProfile()` - Status: **200 OK**
- `deleteProfile()` - Status: **204 No Content** ou **200 OK**

## 📝 Exemples d'utilisation

### Gestion d'erreur 422 (Validation)

```javascript
try {
  await authStore.Signup(userData)
} catch (error) {
  if (error.status === 422 && error.errors) {
    // error.errors contient les erreurs de validation
    error.errors.forEach(err => {
      console.log(`${err.path}: ${err.msg}`)
    })
  } else {
    console.error(error.message)
  }
}
```

### Gestion d'erreur 401 (Non autorisé)

```javascript
try {
  await cartStore.fetchCart()
} catch (error) {
  if (error.status === 401) {
    // Rediriger vers login
    router.push('/login')
  }
}
```

### Gestion d'erreur 409 (Conflit)

```javascript
try {
  await authStore.Signup(userData)
} catch (error) {
  if (error.status === 409) {
    // Email déjà utilisé
    console.error(error.message) // "Conflit avec une ressource existante"
  }
}
```

## 🔍 Vérification de l'implémentation

### Checklist

- ✅ Token Bearer ajouté dans les headers pour toutes les routes protégées
- ✅ Gestion des codes 200, 201, 204 pour les succès
- ✅ Gestion des codes 400, 401, 404, 409, 422 pour les erreurs
- ✅ Middleware d'erreurs compatible avec la structure `{ message, errors, details }`
- ✅ Token supprimé du localStorage en cas d'erreur 401
- ✅ Messages d'erreur clairs selon le type d'erreur

## 🚀 Prochaines étapes

1. Tester tous les endpoints avec différents scénarios d'erreur
2. Ajouter des intercepteurs pour renouveler automatiquement le token
3. Implémenter une notification globale pour les erreurs
4. Ajouter des logs pour le monitoring

---

**Documentation créée le** : 14 décembre 2025
**Version** : 1.0
