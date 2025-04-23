/**
 * Prompts spécifiques au domaine pharmaceutique
 */

// Informations sur le domaine pharmaceutique pour contextualiser les réponses
export const pharmacyDomainContext = `
CONTEXTE MÉTIER:
Les pharmaciens titulaires gèrent leur officine avec différents cycles d'activité:
- Quotidien: Vérification du chiffre d'affaires, analyse des ventes manquées, suivi des stocks critiques
- Hebdomadaire: Analyse des tendances, préparation des commandes, suivi des promotions en cours
- Mensuel: Bilan de performance, comparaison avec périodes antérieures, analyse des marges par catégorie
- Saisonnier: Anticipation des besoins (solaires été, antiviraux hiver), préparation campagnes spécifiques

TERMINOLOGIE MÉTIER:
- Coefficient multiplicateur: Ratio entre prix de vente et prix d'achat
- Taux de marge: Pourcentage représentant la marge brute sur le prix de vente
- Rotation: Nombre de fois où le stock est renouvelé sur une période
- CAMV: Coût d'Achat des Marchandises Vendues
- PPC: Prix Public Conseillé
- Référencement: Décision de vendre un produit et de le maintenir en stock
- Rupture: Indisponibilité temporaire d'un produit
- Marge arrière: Remises ou ristournes accordées par le fournisseur hors facture
- Déréférencement: Décision d'arrêter la vente d'un produit
`;

// Prompt pour l'analyse des ventes
export const salesAnalysisPrompt = `
Pour répondre à une question sur l'analyse des ventes, considère les aspects suivants:
- Évolution temporelle (jour/semaine/mois/année)
- Comparaison avec périodes précédentes
- Segmentation par catégorie/laboratoire/gamme
- Facteurs externes potentiels (saisonnalité, promotions)
- Tendances émergentes

Propose toujours des actions concrètes basées sur l'analyse.
`;

// Prompt pour l'analyse des stocks
export const stockAnalysisPrompt = `
Pour répondre à une question sur l'analyse des stocks, considère les aspects suivants:
- Produits à rotation lente ou nulle (invendus)
- Risques de rupture (stock < seuil critique)
- Surstocks et immobilisation financière
- Optimisation du niveau de stock par produit
- Saisonnalité et anticipation des besoins

Recommande des actions spécifiques pour optimiser la gestion des stocks.
`;

// Prompt pour l'analyse des marges
export const marginAnalysisPrompt = `
Pour répondre à une question sur l'analyse des marges, considère les aspects suivants:
- Rentabilité par produit/catégorie/laboratoire
- Évolution des marges dans le temps
- Impact des promotions sur la marge
- Optimisation du mix produit
- Opportunités d'amélioration des conditions d'achat

Suggère des stratégies concrètes pour améliorer la rentabilité.
`;