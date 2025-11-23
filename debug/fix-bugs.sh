#!/bin/bash

# 🔧 Script de Correction Automatique - MusicGen Wrapper
# Ce script corrige automatiquement les bugs identifiés

set -e

echo "🔍 Démarrage des corrections..."

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    echo "Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

echo -e "${YELLOW}📝 Étape 1: Correction de la syntaxe dans routes.js${NC}"

# Correction 1: Guillemet manquant ligne 183
if [ -f "routes.js" ]; then
    sed -i "s/\`musicgen-\${id}\.wav'/\`musicgen-\${id}\.wav\`/g" routes.js
    echo -e "${GREEN}✅ Guillemet corrigé dans routes.js${NC}"
else
    if [ -f "src/api/routes.js" ]; then
        sed -i "s/\`musicgen-\${id}\.wav'/\`musicgen-\${id}\.wav\`/g" src/api/routes.js
        echo -e "${GREEN}✅ Guillemet corrigé dans src/api/routes.js${NC}"
    else
        echo -e "${RED}❌ Fichier routes.js non trouvé${NC}"
    fi
fi

echo -e "${YELLOW}📝 Étape 2: Correction des imports dans routes.js${NC}"

# Correction 2: Import de createErrorResponse
if [ -f "routes.js" ]; then
    sed -i "s|import { validateGenerationInput } from '../utils/validation.js';|import { validateGenerationInput, createErrorResponse } from '../utils/validation.js';|g" routes.js
    sed -i "/import { createErrorResponse } from '..\/utils\/errors.js';/d" routes.js
    echo -e "${GREEN}✅ Imports corrigés dans routes.js${NC}"
else
    if [ -f "src/api/routes.js" ]; then
        sed -i "s|import { validateGenerationInput } from '../utils/validation.js';|import { validateGenerationInput, createErrorResponse } from '../utils/validation.js';|g" src/api/routes.js
        sed -i "/import { createErrorResponse } from '..\/utils\/errors.js';/d" src/api/routes.js
        echo -e "${GREEN}✅ Imports corrigés dans src/api/routes.js${NC}"
    fi
fi

echo -e "${YELLOW}📝 Étape 3: Vérification de la structure des dossiers${NC}"

# Vérifier si les fichiers sont à la bonne place
NEEDS_RESTRUCTURE=false

if [ -f "routes.js" ] || [ -f "musicgen.service.js" ] || [ -f "validation.js" ]; then
    NEEDS_RESTRUCTURE=true
    echo -e "${YELLOW}⚠️  Les fichiers sont à la racine, restructuration nécessaire${NC}"
fi

if [ "$NEEDS_RESTRUCTURE" = true ]; then
    echo -e "${YELLOW}📁 Réorganisation de la structure...${NC}"
    
    # Créer les dossiers si nécessaire
    mkdir -p src/api src/services src/utils src/config cli
    
    # Déplacer les fichiers
    [ -f "routes.js" ] && mv routes.js src/api/ && echo "  → routes.js déplacé vers src/api/"
    [ -f "musicgen.service.js" ] && mv musicgen.service.js src/services/ && echo "  → musicgen.service.js déplacé vers src/services/"
    [ -f "storage.service.js" ] && mv storage.service.js src/services/ && echo "  → storage.service.js déplacé vers src/services/"
    [ -f "validation.js" ] && mv validation.js src/utils/ && echo "  → validation.js déplacé vers src/utils/"
    [ -f "environment.js" ] && mv environment.js src/config/ && echo "  → environment.js déplacé vers src/config/"
    [ -f "musicgen-cli.js" ] && mv musicgen-cli.js cli/ && echo "  → musicgen-cli.js déplacé vers cli/"
    [ -f "index.js" ] && [ ! -f "src/index.js" ] && mv index.js src/ && echo "  → index.js déplacé vers src/"
    
    echo -e "${GREEN}✅ Structure réorganisée${NC}"
fi

echo -e "${YELLOW}📝 Étape 4: Vérification du fichier .env${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠️  Fichier .env manquant${NC}"
        echo "Voulez-vous créer .env depuis .env.example? (o/n)"
        read -r response
        if [ "$response" = "o" ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Fichier .env créé${NC}"
            echo -e "${YELLOW}⚠️  N'oubliez pas d'ajouter votre REPLICATE_API_TOKEN dans .env${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Créez un fichier .env avec votre configuration${NC}"
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
fi

echo -e "${YELLOW}📝 Étape 5: Vérification des dépendances${NC}"

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${YELLOW}⚠️  Dépendances non installées${NC}"
    echo "Voulez-vous installer les dépendances maintenant? (o/n)"
    read -r response
    if [ "$response" = "o" ]; then
        npm install
        echo -e "${GREEN}✅ Dépendances installées${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✨ Corrections terminées !${NC}"
echo ""
echo "📋 Prochaines étapes :"
echo "  1. Vérifier votre fichier .env"
echo "  2. Ajouter votre REPLICATE_API_TOKEN"
echo "  3. Lancer le serveur : npm start"
echo ""
echo "🧪 Test rapide :"
echo "  npm start"
echo "  curl -X POST http://localhost:3000/api/health"
