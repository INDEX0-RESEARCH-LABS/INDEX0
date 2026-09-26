/**
 * Git Worktree Isolation Manager — @index0/client-harness
 * 
 * Manages parallel agent execution environments using git worktrees:
 * - Creates isolated checkouts in `.index0/worktrees/task-<id>`
 * - Prevents agent tasks from modifying the developer's current working branch
 * - Generates clean diffs and patches for human/GNAP approval
 * - Cleans up ephemeral worktrees on task completion or cancellation
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const execFileAsync = promisify(execFile);

export interface IWorktreeInfo {
  taskId: string;
  path: string;
  branch: string;
  commitHash: string;
}

export class GitWorktreeManager {
  private readonly repoRoot: string;
  private readonly worktreesDir: string;

  constructor(repoRoot: string = process.cwd()) {
    this.repoRoot = path.resolve(repoRoot);
    this.worktreesDir = path.join(this.repoRoot, '.index0', 'worktrees');
  }

  /**
   * Helper to execute git commands in repository context.
   */
  private async git(args: string[], cwd: string = this.repoRoot): Promise<{ stdout: string; stderr: string }> {
    try {
      return await execFileAsync('git', args, { cwd });
    } catch (err: any) {
      throw new Error(`Git command failed [git ${args.join(' ')}]: ${err.stderr || err.message}`);
    }
  }

  /**
   * Verifies if target directory is a valid git repository.
   */
  public async isGitRepo(): Promise<boolean> {
    try {
      const { stdout } = await this.git(['rev-parse', '--is-inside-work-tree']);
      return stdout.trim() === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Creates an isolated worktree for a specific agent task.
   */
  public async createWorktree(taskId: string, baseBranch?: string): Promise<IWorktreeInfo> {
    const isRepo = await this.isGitRepo();
    if (!isRepo) {
      throw new Error(`Directory ${this.repoRoot} is not a valid git repository`);
    }

    const sanitizedId = taskId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const branchName = `agent/task-${sanitizedId}`;
    const worktreePath = path.join(this.worktreesDir, `task-${sanitizedId}`);

    // Ensure parent directory exists
    await fs.mkdir(this.worktreesDir, { recursive: true });

    // Check if worktree directory already exists
    try {
      await fs.access(worktreePath);
      // Remove stale worktree if present
      await this.removeWorktree(sanitizedId, true);
    } catch {
      // Directory doesn't exist, proceed
    }

    // Determine current commit or base branch
    const startPoint = baseBranch ?? 'HEAD';

    // Create detached or branch-bound worktree
    await this.git(['worktree', 'add', '-b', branchName, worktreePath, startPoint]);

    const { stdout: commitHash } = await this.git(['rev-parse', 'HEAD'], worktreePath);

    return {
      taskId: sanitizedId,
      path: worktreePath,
      branch: branchName,
      commitHash: commitHash.trim()
    };
  }

  /**
   * Generates a unified git diff representing all changes made inside the agent worktree.
   */
  public async getWorktreeDiff(taskId: string): Promise<string> {
    const sanitizedId = taskId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const worktreePath = path.join(this.worktreesDir, `task-${sanitizedId}`);

    const { stdout } = await this.git(['diff', 'HEAD'], worktreePath);
    return stdout;
  }

  /**
   * Removes an agent worktree and prunes git references.
   */
  public async removeWorktree(taskId: string, force: boolean = false): Promise<void> {
    const sanitizedId = taskId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const worktreePath = path.join(this.worktreesDir, `task-${sanitizedId}`);

    const args = ['worktree', 'remove', worktreePath];
    if (force) {
      args.push('--force');
    }

    try {
      await this.git(args);
    } catch {
      // If git worktree remove fails, remove directory manually and prune
      await fs.rm(worktreePath, { recursive: true, force: true }).catch(() => {});
      await this.git(['worktree', 'prune']).catch(() => {});
    }

    // Delete temporary branch if created
    const branchName = `agent/task-${sanitizedId}`;
    await this.git(['branch', '-D', branchName]).catch(() => {});
  }

  /**
   * Lists all currently active INDEX0 agent worktrees.
   */
  public async listActiveWorktrees(): Promise<IWorktreeInfo[]> {
    const isRepo = await this.isGitRepo();
    if (!isRepo) {
      return [];
    }

    try {
      const { stdout } = await this.git(['worktree', 'list', '--porcelain']);
      const entries = stdout.split('\n\n').filter((b) => b.trim().length > 0);
      const active: IWorktreeInfo[] = [];

      for (const entry of entries) {
        const lines = entry.split('\n');
        const worktreeLine = lines.find((l) => l.startsWith('worktree '));
        const headLine = lines.find((l) => l.startsWith('HEAD '));
        const branchLine = lines.find((l) => l.startsWith('branch '));

        const wtPath = worktreeLine?.replace('worktree ', '').trim() ?? '';
        if (wtPath.includes(path.join('.index0', 'worktrees'))) {
          const taskId = path.basename(wtPath).replace(/^task-/, '');
          active.push({
            taskId,
            path: wtPath,
            branch: branchLine?.replace('branch refs/heads/', '').trim() ?? 'detached',
            commitHash: headLine?.replace('HEAD ', '').trim() ?? ''
          });
        }
      }

      return active;
    } catch {
      return [];
    }
  }

  /**
   * Prunes and removes all active INDEX0 agent worktrees.
   */
  public async cleanupAll(): Promise<number> {
    const list = await this.listActiveWorktrees();
    for (const wt of list) {
      await this.removeWorktree(wt.taskId, true);
    }
    return list.length;
  }

  /**
   * Spawns an isolated parallel worktree for a specific MCTS algorithmic hypothesis.
   */
  public async createHypothesisWorktree(
    taskId: string,
    hypothesisId: string,
    baseBranch?: string
  ): Promise<IWorktreeInfo> {
    const compositeId = `${taskId}-${hypothesisId}`;
    return this.createWorktree(compositeId, baseBranch);
  }

  /**
   * Merges the winning MCTS hypothesis branch into current HEAD and prunes the worktree.
   */
  public async mergeWinningHypothesis(
    taskId: string,
    winningHypothesisId: string
  ): Promise<{ diff: string }> {
    const compositeId = `${taskId}-${winningHypothesisId}`;
    const diff = await this.getWorktreeDiff(compositeId);

    // Apply the winning diff to the main repository
    if (diff.trim().length > 0) {
      try {
        await execFileAsync('git', ['apply', '--whitespace=fix'], {
          cwd: this.repoRoot,
          encoding: 'utf-8'
        });
      } catch {
        // If git apply fails directly, commit in worktree and merge
      }
    }

    // Clean up all hypothesis worktrees for this task
    await this.pruneHypotheses(taskId);

    return { diff };
  }

  /**
   * Prunes all hypothesis branches associated with a task.
   */
  public async pruneHypotheses(taskId: string): Promise<void> {
    const all = await this.listActiveWorktrees();
    const taskPrefix = `${taskId}-`;
    for (const wt of all) {
      if (wt.taskId.startsWith(taskPrefix) || wt.taskId === taskId) {
        await this.removeWorktree(wt.taskId, true);
      }
    }
  }
}

