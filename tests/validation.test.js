import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MusicGenService } from '../src/services/musicgen.service.js';

describe('Input Validation', () => {
  const service = new MusicGenService();

  describe('Prompt Validation', () => {
    it('should reject empty prompts', () => {
      const result = service.validateGenerationParams({
        prompt: '',
        duration: 10,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.length > 0);
    });

    it('should reject prompts that are too short', () => {
      const result = service.validateGenerationParams({
        prompt: 'hi',
        duration: 10,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('at least')));
    });

    it('should reject prompts that are too long', () => {
      const longPrompt = 'a'.repeat(600);
      const result = service.validateGenerationParams({
        prompt: longPrompt,
        duration: 10,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('cannot exceed')));
    });

    it('should accept valid prompts', () => {
      const result = service.validateGenerationParams({
        prompt: 'uplifting orchestral music with strings',
        duration: 15,
        model: 'large',
      });

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });
  });

  describe('Duration Validation', () => {
    it('should reject duration below minimum', () => {
      const result = service.validateGenerationParams({
        prompt: 'test music',
        duration: 3,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('between')));
    });

    it('should reject duration above maximum', () => {
      const result = service.validateGenerationParams({
        prompt: 'test music',
        duration: 35,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('between')));
    });

    it('should reject non-integer durations', () => {
      const result = service.validateGenerationParams({
        prompt: 'test music',
        duration: 10.5,
        model: 'large',
      });

      assert.strictEqual(result.isValid, false);
    });

    it('should accept valid durations', () => {
      const validDurations = [5, 10, 15, 20, 25, 30];

      validDurations.forEach(duration => {
        const result = service.validateGenerationParams({
          prompt: 'test music',
          duration,
          model: 'large',
        });

        assert.strictEqual(
          result.isValid,
          true,
          `Duration ${duration} should be valid`
        );
      });
    });
  });

  describe('Model Validation', () => {
    it('should reject invalid model names', () => {
      const result = service.validateGenerationParams({
        prompt: 'test music',
        duration: 10,
        model: 'invalid-model',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('must be one of')));
    });

    it('should accept valid model names', () => {
      const validModels = ['small', 'medium', 'large'];

      validModels.forEach(model => {
        const result = service.validateGenerationParams({
          prompt: 'test music',
          duration: 10,
          model,
        });

        assert.strictEqual(
          result.isValid,
          true,
          `Model ${model} should be valid`
        );
      });
    });

    it('should accept undefined model (uses default)', () => {
      const result = service.validateGenerationParams({
        prompt: 'test music',
        duration: 10,
      });

      assert.strictEqual(result.isValid, true);
    });
  });

  describe('Model Info', () => {
    it('should return complete model information', () => {
      const info = service.getModelInfo();

      assert.ok(Array.isArray(info.models));
      assert.ok(info.models.length > 0);
      assert.ok(info.defaults.model);
      assert.ok(typeof info.defaults.duration === 'number');
      assert.ok(typeof info.limits.minDuration === 'number');
      assert.ok(typeof info.limits.maxDuration === 'number');
      assert.ok(typeof info.limits.maxPromptLength === 'number');
    });
  });
});
