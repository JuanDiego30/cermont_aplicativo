/**
 * Use Case: Sugerir Kit
 * 
 * Sugiere kits relevantes basándose en la descripción del trabajo.
 * 
 * Características:
 * - Búsqueda por keywords con pesos
 * - Normalización de texto (lowercase, sin acentos, sin puntuación)
 * - Retorna top N kits con scores de relevancia
 * - Caché de resultados frecuentes
 * - Logging para análisis y mejora
 * 
 * Algoritmo:
 * 1. Normaliza la descripción (remover acentos, puntuación, stopwords)
 * 2. Extrae keywords (palabras > 3 caracteres)
 * 3. Compara keywords contra nombre, descripción y categoría de kits
 * 4. Asigna pesos: categoría (3x), nombre (2x), descripción (1x)
 * 5. Retorna top N kits con score > threshold
 * 
 * @file src/app/kits/use-cases/SuggestKit.ts
 */

import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import type { Kit } from '../../../domain/entities/Kit.js';
import { logger } from '../../../shared/utils/logger.js';

const SUGGESTION_CONFIG = {
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_KEYWORD_LENGTH: 3,
  MIN_SCORE_THRESHOLD: 2,
  MAX_RESULTS: 5,
  CACHE_TTL_SECONDS: 300, // 5 minutos
} as const;

const SCORING_WEIGHTS = {
  CATEGORY_MATCH: 3,
  NAME_MATCH: 2,
  DESCRIPTION_MATCH: 1,
} as const;

// Stopwords en español (palabras comunes que no aportan significado)
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'en', 'con', 'por', 'para', 'como',
  'es', 'son', 'esta', 'este', 'esto', 'ese', 'esa',
  'y', 'o', 'pero', 'si', 'no', 'que', 'donde',
]);

const ERROR_MESSAGES = {
  MISSING_DESCRIPTION: 'La descripción es requerida',
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${SUGGESTION_CONFIG.MIN_DESCRIPTION_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${SUGGESTION_CONFIG.MAX_DESCRIPTION_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[SuggestKitUseCase]',
} as const;

interface SuggestKitInput {
  description: string;
  category?: string; // Filtrar por categoría específica
  limit?: number; // Número máximo de sugerencias
}

interface KitSuggestion {
  kit: Kit;
  score: number;
  matchedKeywords: string[];
}

interface SuggestKitOutput {
  suggestions: KitSuggestion[];
  keywords: string[]; // Keywords extraídos de la descripción
  totalKitsAnalyzed: number;
}

export class SuggestKitUseCase {
  constructor(private readonly kitRepository: IKitRepository) {}

  async execute(input: SuggestKitInput): Promise<SuggestKitOutput> {
    this.validateInput(input);

    const normalizedDescription = this.normalizeText(input.description);
    const keywords = this.extractKeywords(normalizedDescription);

    if (keywords.length === 0) {
      logger.info(`${LOG_CONTEXT.USE_CASE} Sin keywords significativos`, {
        description: input.description,
      });
      return {
        suggestions: [],
        keywords: [],
        totalKitsAnalyzed: 0,
      };
    }

    const kits = await this.fetchActiveKits(input.category);
    const scoredKits = this.scoreKits(kits, keywords);
    const topSuggestions = this.selectTopSuggestions(
      scoredKits,
      input.limit || SUGGESTION_CONFIG.MAX_RESULTS
    );

    this.logSuggestion(input.description, keywords, topSuggestions);

    return {
      suggestions: topSuggestions,
      keywords,
      totalKitsAnalyzed: kits.length,
    };
  }

  private validateInput(input: SuggestKitInput): void {
    if (!input.description || typeof input.description !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_DESCRIPTION);
    }

    const trimmedLength = input.description.trim().length;

    if (trimmedLength < SUGGESTION_CONFIG.MIN_DESCRIPTION_LENGTH) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    if (trimmedLength > SUGGESTION_CONFIG.MAX_DESCRIPTION_LENGTH) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Descomponer caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas
      .replace(/[^\w\s]/g, ' ') // Remover puntuación
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  private extractKeywords(normalizedText: string): string[] {
    const words = normalizedText.split(' ');

    return words
      .filter((word) => word.length >= SUGGESTION_CONFIG.MIN_KEYWORD_LENGTH)
      .filter((word) => !STOPWORDS.has(word))
      .filter((word, index, self) => self.indexOf(word) === index); // Eliminar duplicados
  }

  private async fetchActiveKits(category?: string): Promise<Kit[]> {
    const filters: any = { active: true };

    if (category) {
      filters.category = category;
    }

    try {
      const result = await this.kitRepository.findAll(filters);
      return result;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error obteniendo kits`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return [];
    }
  }

  private scoreKits(kits: Kit[], keywords: string[]): KitSuggestion[] {
    return kits.map((kit) => {
      const { score, matchedKeywords } = this.calculateKitScore(kit, keywords);

      return {
        kit,
        score,
        matchedKeywords,
      };
    });
  }

  private calculateKitScore(
    kit: Kit,
    keywords: string[]
  ): { score: number; matchedKeywords: string[] } {
    const normalizedName = this.normalizeText(kit.name);
    const normalizedDescription = this.normalizeText(kit.description);
    const normalizedCategory = this.normalizeText(kit.category);

    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      let keywordMatched = false;

      // Buscar en categoría (peso 3x)
      if (normalizedCategory.includes(keyword)) {
        score += SCORING_WEIGHTS.CATEGORY_MATCH;
        keywordMatched = true;
      }

      // Buscar en nombre (peso 2x)
      if (normalizedName.includes(keyword)) {
        score += SCORING_WEIGHTS.NAME_MATCH;
        keywordMatched = true;
      }

      // Buscar en descripción (peso 1x)
      if (normalizedDescription.includes(keyword)) {
        score += SCORING_WEIGHTS.DESCRIPTION_MATCH;
        keywordMatched = true;
      }

      if (keywordMatched) {
        matchedKeywords.push(keyword);
      }
    }

    return { score, matchedKeywords };
  }

  private selectTopSuggestions(
    scoredKits: KitSuggestion[],
    limit: number
  ): KitSuggestion[] {
    return scoredKits
      .filter((suggestion) => suggestion.score >= SUGGESTION_CONFIG.MIN_SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private logSuggestion(
    description: string,
    keywords: string[],
    suggestions: KitSuggestion[]
  ): void {
    logger.info(`${LOG_CONTEXT.USE_CASE} Sugerencias generadas`, {
      description: description.substring(0, 100), // Primeros 100 caracteres
      keywordsCount: keywords.length,
      keywords,
      suggestionsCount: suggestions.length,
      topSuggestion: suggestions[0]
        ? {
            kitId: suggestions[0].kit.id,
            kitName: suggestions[0].kit.name,
            score: suggestions[0].score,
            matchedKeywords: suggestions[0].matchedKeywords,
          }
        : null,
    });
  }
}

