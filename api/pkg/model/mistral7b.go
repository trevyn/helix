package model

import (
	"context"
	"fmt"
	"os/exec"
	"path"

	"github.com/lukemarsden/helix/api/pkg/types"
)

type Mistral7bInstruct01 struct {
}

func (l *Mistral7bInstruct01) GetMemoryRequirements(mode types.SessionMode) uint64 {
	if mode == types.SessionModeFinetune {
		return GB * 12
	} else {
		return GB * 6
	}
}

func (l *Mistral7bInstruct01) GetType() types.SessionType {
	return types.SessionTypeText
}

func (l *Mistral7bInstruct01) GetTask(session *types.Session) (*types.WorkerTask, error) {
	if len(session.Interactions) == 0 {
		return nil, fmt.Errorf("session has no messages")
	}
	lastInteraction := session.Interactions[len(session.Interactions)-1]
	return &types.WorkerTask{
		Prompt: fmt.Sprintf("[INST]%s[/INST]", lastInteraction.Message),
	}, nil
}

func (l *Mistral7bInstruct01) GetTextStream(mode types.SessionMode) (*TextStream, error) {
	if mode == types.SessionModeInference {
		return NewTextStream(
			splitOnSpace,
			"[/INST]",
			"</s>",
		), nil
	}
	return nil, nil
}

func (l *Mistral7bInstruct01) GetCommand(ctx context.Context, mode types.SessionMode, config types.RunnerProcessConfig) (*exec.Cmd, error) {
	if mode == types.SessionModeInference {
		cmd := exec.CommandContext(ctx, "/bin/bash", "-c")
		cmd.Dir = path.Join("..", "axolotl")
		cmd.Args = append(cmd.Args, "source venv/bin/activate;")
		cmd.Args = append(
			cmd.Args,
			"python", "-u", "-m",
			"axolotl.cli.inference",
			"examples/mistral/qlora-instruct.yml",
		)

		cmd.Env = append(cmd.Env, fmt.Sprintf("HELIX_GET_JOB_URL=%s", config.TaskURL))
		cmd.Env = append(cmd.Env, fmt.Sprintf("HELIX_RESPOND_JOB_URL=%s", config.ResponseURL))

		return cmd, nil
	}

	return nil, fmt.Errorf("not implemented")
}

// Compile-time interface check:
var _ Model = (*Mistral7bInstruct01)(nil)
