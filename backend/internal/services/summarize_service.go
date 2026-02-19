package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"log_book/internal/models"
	"log_book/internal/repository"
)

type SummarizeService struct {
	documentRepo *repository.DocumentRepository
	userRepo     *repository.UserRepository
	adminRepo    *repository.AdminRepository
	claudeAPIKey string
	httpClient   *http.Client
}

func NewSummarizeService(documentRepo *repository.DocumentRepository, userRepo *repository.UserRepository, adminRepo *repository.AdminRepository, claudeAPIKey string) *SummarizeService {
	return &SummarizeService{
		documentRepo: documentRepo,
		userRepo:     userRepo,
		adminRepo:    adminRepo,
		claudeAPIKey: claudeAPIKey,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

const maxMonthlyRequests = 3

// GetMonthlyUsage returns the user's monthly request count for quota checks.
func (s *SummarizeService) GetMonthlyUsage(ctx context.Context, clerkID string) (used int, limit int, err error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return 0, maxMonthlyRequests, err
	}
	count, err := s.adminRepo.GetMonthlyRequestCount(ctx, user.ID.String())
	if err != nil {
		return 0, maxMonthlyRequests, err
	}
	return count, maxMonthlyRequests, nil
}

// StreamSummary fetches matching documents, builds a prompt, and streams Claude's response.
func (s *SummarizeService) StreamSummary(ctx context.Context, clerkID string, params models.DocumentListParams, writer io.Writer, flusher http.Flusher) error {
	if s.claudeAPIKey == "" {
		return fmt.Errorf("Claude API key not configured")
	}

	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}

	// Check monthly rate limit
	count, err := s.adminRepo.GetMonthlyRequestCount(ctx, user.ID.String())
	if err != nil {
		return err
	}
	if count >= maxMonthlyRequests {
		return fmt.Errorf("RATE_LIMITED: You've used all %d AI summaries for this month. Resets on the 1st.", maxMonthlyRequests)
	}

	docs, err := s.documentRepo.SearchWithContent(ctx, user.ID, params)
	if err != nil {
		return err
	}

	if len(docs) == 0 {
		fmt.Fprintf(writer, "data: {\"text\":\"No documents found matching your search criteria.\"}\n\n")
		flusher.Flush()
		fmt.Fprintf(writer, "data: [DONE]\n\n")
		flusher.Flush()
		return nil
	}

	// Build context from documents
	var promptParts []string
	for _, doc := range docs {
		dateStr := doc.LogDate.Format("2006-01-02")
		title := doc.Title
		if title == "" {
			title = "Untitled"
		}
		text := extractText(doc.Content)
		if text == "" {
			text = "(empty)"
		}
		promptParts = append(promptParts, fmt.Sprintf("--- %s: %s ---\n%s", dateStr, title, text))
	}

	userMessage := fmt.Sprintf(
		"Here are %d work log entries from a volunteer/intern. Summarize what the person accomplished, key activities, and any patterns you notice. Keep your response concise — aim for a brief overview, not a detailed report.\n\n%s",
		len(docs),
		strings.Join(promptParts, "\n\n"),
	)

	// Call Claude API with streaming
	reqBody := map[string]interface{}{
		"model":      "claude-sonnet-4-5-20250929",
		"max_tokens": 1000,
		"stream":     true,
		"messages": []map[string]string{
			{"role": "user", "content": userMessage},
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.claudeAPIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Claude API error %d: %s", resp.StatusCode, string(body))
	}

	var inputTokens, outputTokens int

	// Forward SSE stream
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var event struct {
			Type  string `json:"type"`
			Delta struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"delta"`
		}

		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue
		}

		if event.Type == "content_block_delta" && event.Delta.Text != "" {
			chunk, _ := json.Marshal(map[string]string{"text": event.Delta.Text})
			fmt.Fprintf(writer, "data: %s\n\n", chunk)
			flusher.Flush()
		}

		if event.Type == "message_start" {
			var startEvent struct {
				Message struct {
					Usage struct {
						InputTokens int `json:"input_tokens"`
					} `json:"usage"`
				} `json:"message"`
			}
			if err := json.Unmarshal([]byte(data), &startEvent); err == nil {
				inputTokens = startEvent.Message.Usage.InputTokens
			}
		}

		if event.Type == "message_delta" {
			var deltaEvent struct {
				Usage struct {
					OutputTokens int `json:"output_tokens"`
				} `json:"usage"`
			}
			if err := json.Unmarshal([]byte(data), &deltaEvent); err == nil {
				outputTokens = deltaEvent.Usage.OutputTokens
			}
		}

		if event.Type == "message_stop" {
			// Persist usage stats asynchronously
			go func(uid string, in, out int) {
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer cancel()
				date := time.Now().Format("2006-01-02")
				// Log errors?
				_ = s.adminRepo.UpsertAIUsage(ctx, uid, date, in, out)
			}(user.ID.String(), inputTokens, outputTokens)

			break
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading response stream: %w", err)
	}

	fmt.Fprintf(writer, "data: [DONE]\n\n")
	flusher.Flush()

	return nil
}

// extractText recursively extracts plain text from Tiptap JSONB content.
func extractText(content json.RawMessage) string {
	if content == nil {
		return ""
	}

	var node struct {
		Type    string          `json:"type"`
		Text    string          `json:"text"`
		Content json.RawMessage `json:"content"`
	}

	// Try parsing as a single node
	if err := json.Unmarshal(content, &node); err == nil {
		if node.Text != "" {
			return node.Text
		}
		if node.Content != nil {
			// Content could be an array of child nodes
			var children []json.RawMessage
			if err := json.Unmarshal(node.Content, &children); err == nil {
				var parts []string
				for _, child := range children {
					t := extractText(child)
					if t != "" {
						parts = append(parts, t)
					}
				}
				sep := ""
				if node.Type == "paragraph" || node.Type == "heading" || node.Type == "bulletList" || node.Type == "orderedList" || node.Type == "listItem" {
					sep = "\n"
				}
				return strings.Join(parts, sep)
			}
		}
	}

	return ""
}
