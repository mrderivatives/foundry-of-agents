package protocol

const (
	EventAgentOnline       = "agent.online"
	EventAgentOffline      = "agent.offline"
	EventAgentStatusChange = "agent.status_change"

	EventTaskCreated    = "task.created"
	EventTaskDispatched = "task.dispatched"
	EventTaskProgress   = "task.progress"
	EventTaskCompleted  = "task.completed"
	EventTaskFailed     = "task.failed"

	EventChatMessage = "chat.message"
	EventChatTyping  = "chat.typing"
	EventChatStream  = "chat.stream"
	EventChatDone    = "chat.done"

	EventMemoryCreated = "memory.created"
	EventMemoryUpdated = "memory.updated"

	EventWalletTxProposed = "wallet.tx_proposed"
	EventWalletTxApproved = "wallet.tx_approved"
	EventWalletTxExecuted = "wallet.tx_executed"
	EventWalletTxFailed   = "wallet.tx_failed"
	EventWalletTxBlocked  = "wallet.tx_blocked"

	EventCronFired    = "cron.fired"
	EventCronComplete = "cron.complete"

	EventNotificationSent = "notification.sent"

	EventHeartbeatPing = "heartbeat.ping"
	EventHeartbeatPong = "heartbeat.pong"

	EventWorkspaceUpdated = "workspace.updated"
	EventQuotaWarning     = "quota.warning"
	EventQuotaExceeded    = "quota.exceeded"

	EventDocumentProcessing = "document.processing"
	EventDocumentReady      = "document.ready"

	EventError = "error"
)
