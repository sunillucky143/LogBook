package scheduler

import (
	"context"
	"log"
	"time"

	"log_book/internal/services"
)

type Scheduler struct {
	scheduleService *services.ScheduleService
	interval        time.Duration
	stopChan        chan struct{}
}

func New(scheduleService *services.ScheduleService, interval time.Duration) *Scheduler {
	return &Scheduler{
		scheduleService: scheduleService,
		interval:        interval,
		stopChan:        make(chan struct{}),
	}
}

func (s *Scheduler) Start() {
	ticker := time.NewTicker(s.interval)
	log.Printf("Scheduler started with interval: %v", s.interval)

	go func() {
		for {
			select {
			case <-ticker.C:
				s.processScheduledSessions()
			case <-s.stopChan:
				ticker.Stop()
				log.Println("Scheduler stopped")
				return
			}
		}
	}()
}

func (s *Scheduler) Stop() {
	close(s.stopChan)
}

func (s *Scheduler) processScheduledSessions() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	count, err := s.scheduleService.ProcessScheduledSessions(ctx)
	if err != nil {
		log.Printf("Error processing scheduled sessions: %v", err)
		return
	}

	if count > 0 {
		log.Printf("Auto-stopped %d scheduled session(s)", count)
	}
}
