import { RouteHandler } from "fastify";
import crypto from 'crypto';

import { login } from "@/services/session/login.js";
import { tokenSecretCache, sessionHostCache } from "@/server/cache.js";
import { die } from "@/server/utils/die.js";
import { api } from "@/libs/misskey";

export const legacyAuthController: RouteHandler<{Querystring: {token: string}}> = async (req, reply) => {
	const token = req.query.token as string | undefined;
	if (!token) {
		await die(reply, 'tokenRequired');
		return;
	}
	const host = sessionHostCache[token];
	delete sessionHostCache[token];
	if (!host) {
		await die(reply);
		return;
	}
	const appSecret = tokenSecretCache[token];
	delete tokenSecretCache[token];
	if (!appSecret) {
		await die(reply);
		return;
	}

	const { accessToken, user } = await api<{ accessToken: string, user: Record<string, unknown> }>(host, 'auth/session/userkey', {
		appSecret, token,
	});
	const i = crypto.createHash('sha256').update(accessToken + appSecret, 'utf8').digest('hex');

	await login(reply, user, host, i);
};
