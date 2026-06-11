export { emailGateway } from "./email.gateway";
export {
	getAllGateways,
	getGateway,
	hasGateway,
	type MessageGateway,
	type MessagePayload,
	type MessageResult,
	registerGateway,
} from "./gateway.interface";
export {
	compileNotificationTemplate,
	getAvailableTemplates,
	hasTemplate,
} from "./notification-templates";
export { smsGateway } from "./sms.gateway";
