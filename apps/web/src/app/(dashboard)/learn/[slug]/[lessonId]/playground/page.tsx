'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Play, Square, RotateCcw, Download, Share2, ChevronLeft,
  Terminal, Settings, CheckCircle, XCircle, Loader2, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 71, name: 'Python 3',    ext: 'py',  icon: '🐍', starter: '# Python 3\nprint("Hello, laximotech.ai!")\n\n# Apna code yahan likhein:\nname = input("Aapka naam: ")\nprint(f"Namaste, {name}! 🙏")\n' },
  { id: 63, name: 'JavaScript', ext: 'js',  icon: '⚡', starter: '// JavaScript\nconsole.log("Hello, laximotech.ai!");\n\n// Apna code yahan likhein:\nconst name = "Student";\nconst greet = (n) => `Namaste, ${n}! 🙏`;\nconsole.log(greet(name));\n' },
  { id: 75, name: 'C',          ext: 'c',   icon: '⚙️', starter: '#include <stdio.h>\nint main() {\n    printf("Hello, laximotech.ai!\\n");\n    return 0;\n}\n' },
  { id: 54, name: 'C++',        ext: 'cpp', icon: '🔧', starter: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, laximotech.ai!" << endl;\n    return 0;\n}\n' },
  { id: 62, name: 'Java',       ext: 'java',icon: '☕', starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, laximotech.ai!");\n    }\n}\n' },
];

const THEMES = ['vs-dark', 'light', 'hc-black'];

interface ExecutionResult {
  stdout:      string | null;
  stderr:      string | null;
  status:      { id: number; description: string };
  time:        string | null;
  memory:      number | null;
  compile_output: string | null;
}

export default function PlaygroundPage({ params }: { params: { slug: string; lessonId: string } }) {
  const [lang,     setLang]     = useState(LANGUAGES[0]);
  const [code,     setCode]     = useState(LANGUAGES[0].starter);
  const [input,    setInput]    = useState('');
  const [output,   setOutput]   = useState<ExecutionResult | null>(null);
  const [running,  setRunning]  = useState(false);
  const [theme,    setTheme]    = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync code when language changes
  const switchLang = (l: typeof LANGUAGES[0]) => {
    setLang(l);
    setCode(l.starter);
    setOutput(null);
  };

  const runCode = async () => {
    if (!code.trim()) { toast.error('Please write some code first'); return; }
    setRunning(true);
    setOutput(null);

    try {
      // In production: calls NestJS /api/v1/code/run → Judge0 API
      // For demo, we simulate a result
      await new Promise(r => setTimeout(r, 1800));

      const mockOutput: ExecutionResult = {
        stdout:         'Hello, laximotech.ai!\nNamaste, Student! 🙏\n',
        stderr:         null,
        compile_output: null,
        status:         { id: 3, description: 'Accepted' },
        time:           '0.052',
        memory:         8960,
      };
      setOutput(mockOutput);
    } catch {
      toast.error('Code execution failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const shareCode = () => {
    navigator.clipboard.writeText(window.location.href + '?code=' + encodeURIComponent(code));
    toast.success('Shareable link copied!');
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `laximotech_code.${lang.ext}`; a.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end   = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd   = start + 4;
        }
      }, 0);
    }
    if (e.ctrlKey && e.key === 'Enter') runCode();
  };

  const statusColor = output?.status.id === 3 ? 'text-brand-green' : 'text-red-400';
  const statusIcon  = output?.status.id === 3 ? <CheckCircle size={14} /> : <XCircle size={14} />;

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <Link href={`/learn/${params.slug}/${params.lessonId}`}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <ChevronLeft size={18} />
        </Link>
        <Terminal size={16} className="text-brand-orange flex-shrink-0" />
        <span className="font-heading font-semibold text-white text-sm">Code Playground</span>

        {/* Language selector */}
        <div className="flex gap-1 ml-4 overflow-x-auto no-scrollbar">
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => switchLang(l)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                lang.id === l.id ? 'bg-brand-orange text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}>
              <span>{l.icon}</span> {l.name}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setShowSettings(p => !p)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all">
            <Settings size={15} />
          </button>
          <button onClick={copyCode} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all">
            <Copy size={15} />
          </button>
          <button onClick={downloadCode} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all">
            <Download size={15} />
          </button>
          <button onClick={shareCode} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-6 text-sm overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Theme:</span>
              {THEMES.map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${theme === t ? 'bg-brand-orange text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Font size:</span>
              {[12, 14, 16, 18].map(s => (
                <button key={s} onClick={() => setFontSize(s)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${fontSize === s ? 'bg-brand-orange text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="text-gray-500 text-xs ml-auto">Ctrl+Enter to run</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <span className="text-gray-400 text-xs font-mono">main.{lang.ext}</span>
            <div className="flex gap-1.5">
              {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((c, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
              ))}
            </div>
          </div>

          {/* Code textarea (Monaco in production, textarea in demo) */}
          <div className="flex-1 relative overflow-hidden bg-gray-950">
            {/* Line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-900/50 border-r border-gray-800 flex flex-col pt-3 select-none">
              {code.split('\n').map((_, i) => (
                <div key={i} className="text-gray-600 text-xs text-right pr-2 leading-[1.6rem]">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent text-gray-100 font-mono resize-none outline-none pl-12 pr-4 pt-3 leading-[1.6rem] caret-brand-orange"
              style={{ fontSize: `${fontSize}px`, tabSize: 4 }}
            />
          </div>
        </div>

        {/* Right panel - Input + Output */}
        <div className="w-80 lg:w-96 flex flex-col flex-shrink-0">
          {/* Stdin */}
          <div className="border-b border-gray-800">
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Input (stdin)</span>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Program input here (optional)..."
              rows={4}
              className="w-full bg-gray-950 text-gray-300 font-mono text-xs px-4 py-3 resize-none outline-none placeholder:text-gray-700 border-b border-gray-800"
              style={{ fontSize: `${fontSize - 2}px` }} />
          </div>

          {/* Run button */}
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={runCode} disabled={running}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              {running ? <><Loader2 size={15} className="animate-spin" /> Running...</> : <><Play size={15} fill="white" /> Run Code</>}
            </motion.button>
            <button onClick={() => { setCode(lang.starter); setOutput(null); }}
              className="p-2.5 bg-gray-800 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700 transition-all">
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 overflow-auto bg-gray-950">
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Output</span>
              {output && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
                  {statusIcon} {output.status.description}
                  {output.time && <span className="text-gray-500 ml-2">{output.time}s</span>}
                </div>
              )}
            </div>

            <div className="p-4 font-mono text-xs" style={{ fontSize: `${fontSize - 2}px` }}>
              {running && (
                <div className="flex items-center gap-2 text-brand-orange">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full" />
                  Executing...
                </div>
              )}

              {!running && !output && (
                <div className="text-gray-600">
                  <div className="mb-2">▶ Press Run to execute your code</div>
                  <div className="text-gray-700">Ctrl+Enter for quick run</div>
                </div>
              )}

              {output && (
                <div className="space-y-3">
                  {output.compile_output && (
                    <div>
                      <div className="text-yellow-400 text-[10px] uppercase tracking-wider mb-1">Compile Output</div>
                      <pre className="text-yellow-300 whitespace-pre-wrap">{output.compile_output}</pre>
                    </div>
                  )}
                  {output.stdout && (
                    <div>
                      <div className="text-brand-green text-[10px] uppercase tracking-wider mb-1">stdout</div>
                      <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed">{output.stdout}</pre>
                    </div>
                  )}
                  {output.stderr && (
                    <div>
                      <div className="text-red-400 text-[10px] uppercase tracking-wider mb-1">stderr</div>
                      <pre className="text-red-300 whitespace-pre-wrap">{output.stderr}</pre>
                    </div>
                  )}
                  {output.memory && (
                    <div className="text-gray-600 text-[10px] border-t border-gray-800 pt-2">
                      Memory: {Math.round(output.memory / 1024)}KB
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
