import React, { useState } from 'react';
import type { ISandboxExecutionResult, SandboxLanguage } from '@index0/contracts';
import { ExecutionResult } from './ExecutionResult.js';
import { TerminalViewer, type ITerminalLine } from '../terminal/TerminalViewer.js';
import { Play, Cpu } from 'lucide-react';

const SAMPLES: Record<SandboxLanguage, { name: string; code: string }> = {
  python: {
    name: 'Python Fibonacci',
    code: 'def fib(n):\n    return n if n <= 1 else fib(n-1) + fib(n-2)\n\nprint("fib(10) =", fib(10))\n'
  },
  typescript: {
    name: 'TypeScript Transformation',
    code: 'interface Item { id: number; value: string }\nconst items: Item[] = [{ id: 1, value: "alpha" }, { id: 2, value: "beta" }];\nconsole.log(items.map(i => `${i.id}: ${i.value.toUpperCase()}`));\n'
  },
  bash: {
    name: 'Bash System Audit',
    code: 'echo "Host: $(uname -s)"\necho "Uptime: $(uptime)"\n'
  }
};

export const SandboxRunnerDemo: React.FC = () => {
  const [language, setLanguage] = useState<SandboxLanguage>('python');
  const [code, setCode] = useState(SAMPLES.python.code);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ISandboxExecutionResult | null>(null);
  const [terminalLines, setTerminalLines] = useState<ITerminalLine[]>([]);

  const handleLanguageChange = (newLang: SandboxLanguage) => {
    setLanguage(newLang);
    setCode(SAMPLES[newLang].code);
  };

  const handleRun = () => {
    setIsRunning(true);
    const reqId = `demo-${Date.now()}`;
    const startTime = Date.now();

    setTimeout(() => {
      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      if (code.includes('error') || code.includes('fail')) {
        exitCode = 1;
        stderr = 'Simulated Error: Execution failed\n';
      } else if (language === 'python') {
        stdout = 'fib(10) = 55\n';
      } else if (language === 'typescript') {
        stdout = "['1: ALPHA', '2: BETA']\n";
      } else {
        stdout = 'Host: Linux\nUptime: 42 days, 10:14\n';
      }

      const res: ISandboxExecutionResult = {
        id: reqId,
        exitCode,
        stdout,
        stderr,
        durationMs: Date.now() - startTime,
        timedOut: false
      };

      setResult(res);
      setTerminalLines((prev) => [
        ...prev,
        {
          id: reqId,
          timestamp: new Date().toLocaleTimeString(),
          command: `${language} run snippet`,
          output: stdout || stderr,
          isError: exitCode !== 0
        }
      ]);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu color="var(--accent-cyan)" />
          INDEX0 AI Sandbox Runner Playground
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Simulate multi-language isolated microVM executions and visualize contract outputs.
        </p>
      </div>

      {/* Language Tabs & Run Control */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['python', 'typescript', 'bash'] as SandboxLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: language === lang ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'capitalize'
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '6px',
            background: 'var(--color-success)',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          <Play size={14} />
          {isRunning ? 'Executing...' : 'Run in Sandbox'}
        </button>
      </div>

      {/* Code Input */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={code}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            background: '#07090e',
            color: '#e2e8f0',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Visualizers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {result && <ExecutionResult result={result} language={language} />}
        <TerminalViewer lines={terminalLines} onClear={() => setTerminalLines([])} />
      </div>
    </div>
  );
};
