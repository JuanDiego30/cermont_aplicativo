/**
 * Counter Repository Implementation — Orders Domain
 *
 * Mongoose-backed implementation of ICounterRepository.
 * Wraps the atomic Counter.inc static method. No business logic.
 */

import type { ICounterRepository } from "../domain/counter.repository";
import { Counter } from "./counter.model";

export class CounterRepository implements ICounterRepository {
	async inc(key: string): Promise<number> {
		return Counter.inc(key);
	}
}
