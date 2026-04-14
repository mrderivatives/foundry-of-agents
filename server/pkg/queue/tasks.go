package queue

const (
	TypeTaskExecute      = "task:execute"
	TypeCronFire         = "cron:fire"
	TypeHeartbeatFire    = "heartbeat:fire"
	TypeNotificationSend = "notification:send"
	TypeDocumentProcess  = "document:process"
)

type TaskExecutePayload struct {
	TaskID      string `json:"task_id"`
	WorkspaceID string `json:"workspace_id"`
	AgentID     string `json:"agent_id"`
	RuntimeID   string `json:"runtime_id"`
}

type CronFirePayload struct {
	CronJobID   string `json:"cron_job_id"`
	WorkspaceID string `json:"workspace_id"`
}

type HeartbeatFirePayload struct {
	AgentID     string `json:"agent_id"`
	WorkspaceID string `json:"workspace_id"`
}

type NotificationSendPayload struct {
	NotificationID string `json:"notification_id"`
	WorkspaceID    string `json:"workspace_id"`
	UserID         string `json:"user_id"`
	Channel        string `json:"channel"`
	Content        string `json:"content"`
	AgentName      string `json:"agent_name"`
}

type DocumentProcessPayload struct {
	DocumentID  string `json:"document_id"`
	WorkspaceID string `json:"workspace_id"`
}
