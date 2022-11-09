/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package kogito

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func Systray(port string, jitexecutor []byte) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	view := &KogitoSystray{}
	server := NewProxy(ctx, port, jitexecutor)

	server.view = view
	view.server = server

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		log.Println("Signal detected, shutting down...")
		server.Stop()
		os.Exit(0)
	}()

	view.Run()
}
