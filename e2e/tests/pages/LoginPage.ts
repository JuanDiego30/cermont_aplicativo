import type { Page } from "@playwright/test";

export class LoginPage {
	constructor(private readonly page: Page) {}

	async fillCredentials(email: string, password: string) {
		await this.page.getByLabel("Email").fill(email);
		await this.page.getByLabel("Password").fill(password);
	}

	async submit() {
		await this.page.getByRole("button", { name: /iniciar sesión/i }).click();
	}
}
