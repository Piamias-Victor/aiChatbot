export interface AutoResponse {
    keywords: string[];
    response: string;
  }
  
  export const chatResponses: AutoResponse[] = [
    {
      keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'],
      response: "Bonjour ! Je suis votre assistant analytique pour la pharmacie. Comment puis-je vous aider aujourd'hui ?"
    },
    {
      keywords: ['vente', 'chiffre', 'ca', 'revenus'],
      response: "Je pourrai bientôt analyser vos données de vente. Voici ce que je pourrai faire :\n\n" + 
                "- Identifier vos produits les plus vendus\n" + 
                "- Analyser les tendances de vente par période\n" + 
                "- Comparer vos performances actuelles avec les périodes précédentes\n" + 
                "- Segmenter vos ventes par catégorie de produits"
    },
    {
      keywords: ['stock', 'inventaire', 'rupture'],
      response: "La gestion des stocks est cruciale pour une pharmacie. Je pourrai vous aider à :\n\n" + 
                "- Identifier les produits à faible rotation\n" + 
                "- Anticiper les risques de rupture de stock\n" + 
                "- Analyser la saisonnalité pour optimiser vos commandes\n" + 
                "- Calculer le stock optimal pour chaque produit"
    },
    {
      keywords: ['marge', 'profit', 'rentabilité', 'bénéfice'],
      response: "L'analyse des marges est essentielle pour optimiser votre rentabilité. Je pourrai vous aider à :\n\n" + 
                "- Identifier vos produits les plus rentables\n" + 
                "- Analyser la marge par catégorie de produits\n" + 
                "- Détecter les produits à faible marge mais fort volume\n" + 
                "- Comparer vos marges avec les périodes précédentes"
    },
    {
      keywords: ['client', 'patient', 'fidélité'],
      response: "L'analyse des comportements clients peut vous aider à fidéliser votre clientèle. Je pourrai :\n\n" + 
                "- Identifier vos clients les plus fidèles\n" + 
                "- Analyser les habitudes d'achat par segment de clientèle\n" + 
                "- Suggérer des opportunités de vente croisée\n" + 
                "- Évaluer l'efficacité de vos programmes de fidélité"
    },
    {
      keywords: ['laboratoire', 'fournisseur', 'marque'],
      response: "L'analyse par laboratoire ou fournisseur permet d'optimiser vos partenariats. Je pourrai :\n\n" + 
                "- Comparer les performances des différents laboratoires\n" + 
                "- Identifier les fournisseurs les plus rentables\n" + 
                "- Analyser l'évolution des ventes par laboratoire\n" + 
                "- Évaluer l'impact des promotions par marque"
    },
    {
      keywords: ['commande', 'achat', 'approvisionnement'],
      response: "L'optimisation des commandes est importante pour votre trésorerie. Je pourrai vous aider à :\n\n" + 
                "- Générer des suggestions de commande basées sur l'historique\n" + 
                "- Anticiper les besoins saisonniers\n" + 
                "- Identifier les opportunités d'achat groupé\n" + 
                "- Analyser le délai de rotation de vos stocks"
    }
  ];